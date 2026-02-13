import { prisma } from "../../lib/db";
import { redirect } from "next/navigation";
import { Card } from "../../components/Card";

export default async function BulkPage() {
  const containers = await prisma.entity.findMany({
    where: { type: { in: ["ORG", "EVENT", "LOCATION"] as any } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, type: true }
  });

  async function bulkCreate(fd: FormData) {
    "use server";
    const containerId = String(fd.get("containerId") || "");
    const relType = String(fd.get("relType") || "ASSOCIATED_WITH");
    const startDate = String(fd.get("startDate") || "");
    const endDate = String(fd.get("endDate") || "");
    const text = String(fd.get("names") || "");
    const names = text.split(/\r?\n|,/).map(s => s.trim()).filter(Boolean);

    if (!containerId || names.length === 0) return;

    for (const name of names) {
      const person = await prisma.entity.create({ data: { type: "PERSON" as any, name } });
      await prisma.relationship.create({
        data: {
          fromId: person.id,
          toId: containerId,
          type: relType,
          startDate,
          endDate,
          strength: 50,
          notes: "Bulk intake"
        }
      });
    }

    redirect("/");
  }

  return (
    <div className="space-y-3">
      <div className="text-lg font-semibold">Bulk Intake</div>
      <div className="text-sm text-slate-300">
        Paste a list of names. The app will create people and link them to an organisation/event/location.
      </div>

      <Card title="Paste names">
        <form action={bulkCreate} className="space-y-2">
          <select name="containerId" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm">
            <option value="">Link to...</option>
            {containers.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
            ))}
          </select>
          <input name="relType" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm"
            placeholder="Relationship type (e.g. WORKED_AT, MEMBER_OF, PRESENT_AT)" />
          <div className="flex gap-2">
            <input name="startDate" className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="Start (e.g. 2018)" />
            <input name="endDate" className="flex-1 rounded-xl bg-white/5 border border-white/10 p-3 text-sm" placeholder="End (optional)" />
          </div>
          <textarea name="names" className="w-full rounded-xl bg-white/5 border border-white/10 p-3 text-sm min-h-[160px]"
            placeholder={"Paste names (one per line)\nJane Doe\nJohn Smith\n..."} />
          <button className="w-full rounded-xl bg-white text-black py-3 font-semibold">Create People + Link</button>
        </form>
      </Card>
    </div>
  );
}
