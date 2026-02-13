import Link from "next/link";
import { prisma } from "../../lib/db";
import { Card } from "../../components/Card";

export default async function TimelinePage() {
  const events = await prisma.entity.findMany({
    where: { type: "EVENT" },
    orderBy: { updatedAt: "desc" },
    take: 40
  });

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Timeline</div>
      <div className="text-sm text-slate-300">Events (MVP). Add date info in notes or add eventDate/eventEnd later.</div>

      {events.map(e => (
        <Link key={e.id} href={`/entity/${e.id}`}>
          <Card title={e.name} subtitle={e.eventDate ? e.eventDate : "No date set"}>
            <div className="text-sm text-slate-200 line-clamp-2">{e.notes || "No notes yet."}</div>
          </Card>
        </Link>
      ))}

      {events.length === 0 ? (
        <div className="text-sm text-slate-400">No events yet. Create Event entities.</div>
      ) : null}
    </div>
  );
}
