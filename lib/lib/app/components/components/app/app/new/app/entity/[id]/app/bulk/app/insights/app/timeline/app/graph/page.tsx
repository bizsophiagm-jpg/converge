import Link from "next/link";
import { prisma } from "../../lib/db";
import { Card } from "../../components/Card";

export default async function GraphPage() {
  const rels = await prisma.relationship.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { from: true, to: true }
  });

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Graph</div>
      <div className="text-sm text-slate-300">
        MVP graph list (mobile-friendly). Next iteration adds an interactive node map.
      </div>

      {rels.map(r => (
        <Card
          key={r.id}
          title={`${r.from.name} → ${r.type} → ${r.to.name}`}
          subtitle={`${r.startDate || "?"}–${r.endDate || "?"} • strength ${r.strength}`}
        >
          <div className="flex gap-2">
            <Link className="flex-1 rounded-xl bg-white/10 py-2 text-center text-sm" href={`/entity/${r.fromId}`}>From</Link>
            <Link className="flex-1 rounded-xl bg-white/10 py-2 text-center text-sm" href={`/entity/${r.toId}`}>To</Link>
          </div>
          {r.notes ? <div className="text-sm mt-2 text-slate-200">{r.notes}</div> : null}
        </Card>
      ))}
    </div>
  );
}
