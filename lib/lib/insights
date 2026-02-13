import { prisma } from "./db";

type Insight =
  | { type: "DUPLICATE_NAME"; title: string; details: string; ids: string[] }
  | { type: "SHARED_ORG_YEAR"; title: string; details: string; ids: string[] }
  | { type: "CONNECTION_CHAIN"; title: string; details: string; ids: string[] };

function normName(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function buildInsights(): Promise<Insight[]> {
  const insights: Insight[] = [];

  const people = await prisma.entity.findMany({
    where: { type: "PERSON" },
    select: { id: true, name: true }
  });

  // Duplicate-ish name detection (basic)
  const buckets = new Map<string, { name: string; ids: string[] }>();
  for (const p of people) {
    const key = normName(p.name);
    const b = buckets.get(key) ?? { name: p.name, ids: [] };
    b.ids.push(p.id);
    buckets.set(key, b);
  }
  for (const [, b] of buckets) {
    if (b.ids.length >= 2) {
      insights.push({
        type: "DUPLICATE_NAME",
        title: "Possible duplicate person records",
        details: `Same normalized name appears ${b.ids.length} times: "${b.name}"`,
        ids: b.ids
      });
    }
  }

  // Shared org + year: look for WORKED_AT relationships with same org + startDate containing same year
  const rels = await prisma.relationship.findMany({
    where: { type: "WORKED_AT" },
    select: { fromId: true, toId: true, startDate: true, endDate: true }
  });

  // group by orgId + year
  const byOrgYear = new Map<string, string[]>();
  for (const r of rels) {
    const year = (r.startDate.match(/\b(19|20)\d{2}\b/)?.[0]) ?? "";
    if (!year) continue;
    const key = `${r.toId}:${year}`;
    const arr = byOrgYear.get(key) ?? [];
    arr.push(r.fromId);
    byOrgYear.set(key, arr);
  }
  for (const [key, ids] of byOrgYear) {
    const unique = Array.from(new Set(ids));
    if (unique.length >= 2) {
      const [orgId, year] = key.split(":");
      const org = await prisma.entity.findUnique({ where: { id: orgId }, select: { name: true } });
      insights.push({
        type: "SHARED_ORG_YEAR",
        title: "Shared workplace overlap",
        details: `${unique.length} people linked to "${org?.name ?? "Unknown"}" in ${year}`,
        ids: unique
      });
    }
  }

  // Connection chain (basic): pick top 5 pairs and compute shortest path in relationship graph
  // NOTE: This is intentionally lightweight for MVP.
  const allRels = await prisma.relationship.findMany({
    select: { fromId: true, toId: true, type: true }
  });

  const adj = new Map<string, Set<string>>();
  const addEdge = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    if (!adj.has(b)) adj.set(b, new Set());
    adj.get(a)!.add(b);
    adj.get(b)!.add(a);
  };
  for (const r of allRels) addEdge(r.fromId, r.toId);

  const sample = people.slice(0, Math.min(6, people.length));
  for (let i = 0; i < sample.length; i++) {
    for (let j = i + 1; j < sample.length; j++) {
      const a = sample[i].id, b = sample[j].id;
      const path = shortestPath(adj, a, b, 5);
      if (path && path.length >= 3) {
        insights.push({
          type: "CONNECTION_CHAIN",
          title: "Indirect connection chain found",
          details: `A ${path.length - 1}-step chain exists between "${sample[i].name}" and "${sample[j].name}"`,
          ids: path
        });
      }
    }
  }

  return insights.slice(0, 50);
}

function shortestPath(adj: Map<string, Set<string>>, start: string, goal: string, maxDepth: number) {
  if (start === goal) return [start];
  const q: string[] = [start];
  const prev = new Map<string, string | null>();
  prev.set(start, null);

  while (q.length) {
    const cur = q.shift()!;
    const depth = pathDepth(prev, cur);
    if (depth >= maxDepth) continue;

    for (const nxt of adj.get(cur) ?? []) {
      if (prev.has(nxt)) continue;
      prev.set(nxt, cur);
      if (nxt === goal) return reconstruct(prev, goal);
      q.push(nxt);
    }
  }
  return null;
}

function pathDepth(prev: Map<string, string | null>, node: string) {
  let d = 0;
  let cur: string | null | undefined = node;
  while (cur != null) {
    cur = prev.get(cur);
    if (cur != null) d++;
    if (d > 50) break;
  }
  return d;
}

function reconstruct(prev: Map<string, string | null>, end: string) {
  const out: string[] = [];
  let cur: string | null | undefined = end;
  while (cur != null) {
    out.push(cur);
    cur = prev.get(cur);
  }
  out.reverse();
  return out;
}
