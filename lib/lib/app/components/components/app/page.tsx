import Link from "next/link";
import { prisma } from "../lib/db";
import { Card } from "../components/Card";

export default async function EntitiesHome() {
  const entities = await prisma.entity.findMany({
    orderBy: { updatedAt: "desc" },
    take: 40
  });

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Link className="flex-1 rounded-xl bg-white text-black py-3 text-center font-semibold" href="/new">
          + New Entity
        </Link>
        <Link className="flex-1 rounded-xl bg-white/10 py-3 text-center font-semibold" href="/search">
          Search
        </Link>
      </div>

      <div className="text-xs text-slate-400 mb-2">Recent</div>
      {entities.map(e => (
        <Link key={e.id} href={`/entity/${e.id}`}>
          <Card title={e.name} subtitle={`${e.type}${e.aliases ? " • aliases" : ""}`}>
            <div className="text-sm text-slate-200 line-clamp-2">{e.notes || "No notes yet."}</div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
