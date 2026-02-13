import Link from "next/link";
import { buildInsights } from "../../lib/insights";
import { Card } from "../../components/Card";
import { prisma } from "../../lib/db";

export default async function InsightsPage() {
  const insights = await buildInsights();

  // For display: resolve entity names for ids
  const allIds = Array.from(new Set(insights.flatMap(i => i.ids)));
  const entities = await prisma.entity.findMany({ where: { id: { in: allIds } }, select: { id: true, name: true, type: true } });
  const map = new Map(entities.map(e => [e.id, e]));

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Insights</div>
      <div className="text-sm text-slate-300">
        Auto-detected coincidences, overlaps, chains, and duplicates.
      </div>

      {insights.map((i, idx) => (
        <Card key={idx} title={i.title} subtitle={i.type}>
          <div className="text-sm text-slate-200">{i.details}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {i.ids.map(id => {
              const e = map.get(id);
              if (!e) return null;
              return (
                <Link key={id} href={`/entity/${id}`} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">
                  {e.name}
                </Link>
              );
            })}
          </div>
        </Card>
      ))}

      {insights.length === 0 ? (
        <div className="text-sm text-slate-400">No insights yet. Add more data and relationships.</div>
      ) : null}
    </div>
  );
}
