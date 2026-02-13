import Link from "next/link";
import { prisma } from "../../lib/db";

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams.q || "").trim();
  const results = q
    ? await prisma.entity.findMany({
        where: { name: { contains: q } },
        orderBy: { updatedAt: "desc" },
        take: 50
      })
    : [];

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Search</div>
      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm"
          placeholder="Search entities..."
        />
        <button className="rounded-xl bg-white text-black px-4 font-semibold">Go</button>
      </form>

      <div className="space-y-2">
        {results.map(r => (
          <Link key={r.id} href={`/entity/${r.id}`} className="block rounded-xl bg-white/5 border border-white/10 p-3">
            <div className="font-semibold">{r.name}</div>
            <div className="text-xs text-slate-400">{r.type}</div>
          </Link>
        ))}
      </div>

      {!q ? <div className="text-sm text-slate-400">Type a query to search.</div> : null}
    </div>
  );
}
