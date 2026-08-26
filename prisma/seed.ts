import { PrismaClient } from "@prisma/client";
import { generateActivationCode } from "../lib/codes";

const prisma = new PrismaClient();

async function main() {
  const demo = await prisma.event.upsert({
    where: { id: "demo" },
    update: {},
    create: {
      id: "demo",
      name: "Sarah & David Wedding",
      organizerName: "Sarah Doe",
      whatsapp: "+237 6XX XXX XXX",
      email: "sarah@example.com",
      eventDate: "24 Oct 2026",
      activationCode: generateActivationCode(),
      usherToken: "demo-token",
      status: "Active",
    },
  });

  const existing = await prisma.guest.count({ where: { eventId: demo.id } });
  if (existing === 0) {
    const rows: { name: string; table: string; seat: string }[] = [
      { name: "John Doe", table: "Table 01", seat: "A1" },
      { name: "Sarah Doe", table: "Table 01", seat: "A2" },
      { name: "Michael Smith", table: "Table 01", seat: "A3" },
      { name: "David Johnson", table: "Table 02", seat: "B1" },
      { name: "Mary Johnson", table: "Table 02", seat: "B2" },
      { name: "Peter Smith", table: "Table 02", seat: "B3" },
      { name: "Amara Nkeng", table: "Table 03", seat: "A2" },
      { name: "Paul Etoa", table: "Table 07", seat: "C1" },
    ];
    await prisma.guest.createMany({ data: rows.map((r) => ({ ...r, eventId: demo.id })) });
    // pre-check-in a couple guests so the usher demo has live numbers
    const seeded = await prisma.guest.findMany({ where: { eventId: demo.id }, take: 2 });
    for (const g of seeded) {
      await prisma.guest.update({ where: { id: g.id }, data: { checkedIn: true, checkedInAt: new Date() } });
      await prisma.entry.create({ data: { eventId: demo.id, guestId: g.id, guestName: g.name } });
    }
  }

  console.log("Seeded demo event. Organizer activation code:", demo.activationCode);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
