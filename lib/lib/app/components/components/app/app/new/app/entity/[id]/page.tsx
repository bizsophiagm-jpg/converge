import { prisma } from "../../../lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "../../../components/Card";

export default async function EntityPage({ params }: { params: { id: string } }) {
  const e = await prisma.entity.findUnique({
    where: { id: params.id },
    include: {
      tags: { include: { tag: true } },
      evidence: { orderBy: { createdAt: "desc" } },
      relFrom: { include: { to: true }, orderBy: { createdAt: "desc" } },
      relTo: { include: { from: true }, orderBy: { createdAt: "desc" } }
    }
  });
  if (!e) return <div>Not found</div>;

  async function saveNotes(fd: FormData) {
    "use server";
    const notes = String(fd.get("notes") || "");
    const aliases = String(fd.get("aliases") || "");
    await prisma.entity.update({ where: { id: e.id }, data: { notes, aliases } });
    redirect(`/entity/${e.id}`);
  }

  async function addEvidence(fd: FormData) {
    "use server";
    const content = String(fd.get("content") || "").trim();
    if (!content) return;
    await prisma.evidence.create({ data: { entityId: e.id, kind: content.startsWith("http") ? "LINK" : "NOTE", content } });
    redirect(`/entity/${e.id}`);
  }

  async function addRel(fd: FormData) {
    "use server";
    const toId = String(fd.get("toId") || "");
    const type = String(fd.get("type") || "ASSOCIATED_WITH");
    const startDate = String(fd.get("startDate") || "");
    const endDate = String(fd.get("endDate") || "");
    const strength = Number(fd.get("strength") || 50);
    const notes = String(fd.get("rnotes") || "");
    if (!toId) return;
    await prisma.relationship.create({ data: { fromId: e.id, toId, type, startDate, endDate, strength, notes } });
    redirect(`/entity/${e.id}`);
  }

  async function addTag(fd: FormData) {
    "use server";
    const name = String(fd.get("tag") || "").trim();
    const kind = String(fd.get("kind") || "GENERAL").trim();
    const value = String(fd.get("value") || "").trim();
    if (!name) return;
    const tag = await prisma.tag.upsert({ where: { name }, create: { name, kind }, update: {} });
    await prisma.tagOnEntity.upsert({
      where: { entityId_tagId: { entityId: e.id, tagId: tag.id } },
      create: { entityId: e.id, tagId: tag.id, value },
      update: { value }
    });
    redirect(`/entity/${e.id}`);
  }

  const allEntities = await prisma.entity.findMany({
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" }
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">{e.name}</div>
          <div className="text-xs text-slate-400">{e.type}</div>
        </div>
        <Link className="text-sm text-slate-300 underline" href="/bulk">Bulk</Link>
      </div>

      <Card title="Notes">
        <form action={saveNotes} className="space-y-2">
          <input name="aliases" defaultValue={e.aliases} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm"
            placeholder="Aliases (comma-separated)" />
          <textarea name="notes" defaultValue={e.notes} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm min-h-[120px]"
            placeholder="Write intelligence notes..." />
          <button className="w-full rounded-xl bg-white text-black py-3 font-semibold">Save</button>
        </form>
      </Card>

      <Card title="Tags">
        <div className="flex flex-wrap gap-2 mb-3">
          {e.tags.map(t => (
            <span key={t.id} className="text-xs px-2 py-1 rounded-full bg-white/10 border border-white/10">
              {t.tag.name}{t.value ? `:${t.value}` : ""}
            </span>
          ))}
          {e.tags.length === 0 ? <div className="text-sm text-slate-400">No tags yet.</div> : null}
        </div>
        <form action={addTag} className="space-y-2">
          <input name="tag" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Tag name (e.g. FINANCIAL_DISTRESS)" />
          <div className="flex gap-2">
            <input name="kind" className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Kind (GENERAL/RISK/ROLE...)" />
            <input name="value" className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Value (optional)" />
          </div>
          <button className="w-full rounded-xl bg-white/10 py-3 font-semibold">Add/Update Tag</button>
        </form>
      </Card>

      <Card title="Evidence">
        <form action={addEvidence} className="space-y-2">
          <input name="content" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Paste a note or link..." />
          <button className="w-full rounded-xl bg-white/10 py-3 font-semibold">Attach</button>
        </form>
        <div className="mt-3 space-y-2">
          {e.evidence.map(ev => (
            <div key={ev.id} className="text-sm rounded-xl bg-black/30 border border-white/10 p-3">
              <div className="text-xs text-slate-400">{ev.kind}</div>
              <div className="break-words">{ev.content}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card title="Relationships">
        <div className="text-xs text-slate-400 mb-2">Outgoing</div>
        <div className="space-y-2 mb-4">
          {e.relFrom.map(r => (
            <Link key={r.id} href={`/entity/${r.toId}`}>
              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                <div className="text-sm font-semibold">{r.type} → {r.to.name}</div>
                <div className="text-xs text-slate-400">{r.startDate || "?"}–{r.endDate || "?"} • strength {r.strength}</div>
                {r.notes ? <div className="text-sm mt-1 text-slate-200">{r.notes}</div> : null}
              </div>
            </Link>
          ))}
          {e.relFrom.length === 0 ? <div className="text-sm text-slate-400">No outgoing relationships.</div> : null}
        </div>

        <div className="text-xs text-slate-400 mb-2">Incoming</div>
        <div className="space-y-2 mb-4">
          {e.relTo.map(r => (
            <Link key={r.id} href={`/entity/${r.fromId}`}>
              <div className="rounded-xl bg-black/30 border border-white/10 p-3">
                <div className="text-sm font-semibold">{r.from.name} → {r.type}</div>
                <div className="text-xs text-slate-400">{r.startDate || "?"}–{r.endDate || "?"} • strength {r.strength}</div>
                {r.notes ? <div className="text-sm mt-1 text-slate-200">{r.notes}</div> : null}
              </div>
            </Link>
          ))}
          {e.relTo.length === 0 ? <div className="text-sm text-slate-400">No incoming relationships.</div> : null}
        </div>

        <form action={addRel} className="space-y-2">
          <div className="text-sm font-semibold">Add relationship</div>
          <select name="toId" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm">
            <option value="">Select target...</option>
            {allEntities.filter(x => x.id !== e.id).map(x => (
              <option key={x.id} value={x.id}>{x.name} ({x.type})</option>
            ))}
          </select>
          <input name="type" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder='Type (e.g. WORKED_AT, DONATED_TO, FAMILY)' />
          <div className="flex gap-2">
            <input name="startDate" className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Start (e.g. 2018-01)" />
            <input name="endDate" className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="End (optional)" />
          </div>
          <input name="strength" defaultValue={50} className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Strength 0-100" />
          <textarea name="rnotes" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Relationship notes (optional)" />
          <button className="w-full rounded-xl bg-white text-black py-3 font-semibold">Add</button>
        </form>
      </Card>
    </div>
  );
}
