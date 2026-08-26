import { MessageCircle, Mail, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const ROWS = [
  { icon: MessageCircle, label: "WhatsApp", cta: "Contact us" },
  { icon: Mail, label: "Email", cta: "Send us an email" },
  { icon: Phone, label: "Phone", cta: "Call us" },
];

export default function ContactPage() {
  return (
    <div className="mx-auto w-full max-w-xl px-4 py-8 md:px-8">
      <h1 className="text-xl font-semibold tracking-tight2">Need help?</h1>
      <p className="mt-1 text-sm text-muted">Our team is here to help you prepare your event.</p>

      <div className="mt-6 space-y-3">
        {ROWS.map(({ icon: Icon, label, cta }) => (
          <Card key={label} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-paper border border-line">
                <Icon size={16} strokeWidth={1.75} className="text-ink" />
              </div>
              <p className="text-sm font-medium">{label}</p>
            </div>
            <Button variant="secondary">{cta}</Button>
          </Card>
        ))}
      </div>

      <div className="mt-8 border-t border-line pt-6">
        <p className="text-xs font-semibold uppercase tracking-tight2 text-muted">About us</p>
        <p className="mt-2 text-sm text-ink/80">
          We help event planners run a calmer, more organized guest entry — one QR code,
          always accurate seating, no paperwork at the door.
        </p>
      </div>
    </div>
  );
}
