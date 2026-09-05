import { NextRequest, NextResponse } from "next/server";
import { finalizeGuestImport } from "@/lib/finalize-import";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params;
  const url = process.env.PARSER_SERVICE_URL;

  if (!url) {
    return NextResponse.json(
      { error: "File parsing service isn't configured (PARSER_SERVICE_URL missing)." },
      { status: 500 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Couldn't read the uploaded file." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file received." }, { status: 400 });
  }

  try {
    const forwardForm = new FormData();
    forwardForm.append("file", file, file.name);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // large files need more room than the old 8s CSV timeout

    const res = await fetch(`${url}/api/parse-file`, {
      method: "POST",
      body: forwardForm,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "The parsing service couldn't read that file.", detail: detail.slice(0, 300) },
        { status: 422 }
      );
    }

    const data = await res.json();
    if (!Array.isArray(data.guests)) {
      return NextResponse.json({ error: "Unexpected response from the parsing service." }, { status: 502 });
    }

    const outcome = await finalizeGuestImport(eventId, data.guests, file.name);
    return NextResponse.json(
      {
        ...outcome.body,
        errors: data.errors ?? outcome.body.errors,
        skipped: typeof data.skipped === "number" ? data.skipped : outcome.body.skipped,
      },
      { status: outcome.status }
    );
  } catch (err) {
    console.error("Direct file upload failed:", err);
    return NextResponse.json({ error: "Something went wrong processing that file. Try again." }, { status: 500 });
  }
}