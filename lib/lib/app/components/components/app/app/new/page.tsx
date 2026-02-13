import { redirect } from "next/navigation";
import { prisma } from "../../lib/db";

export default function NewEntityPage() {
  async function create(formData: FormData) {
    "use server";
    const type = String(formData.get("type") || "PERSON");
    const name = String(formData.get("name") || "").trim();
    if (!name) return;

    const e = await prisma.entity.create({
      data: { type: type as any, name }
    });

    redirect(`/entity/${e.id}`);
  }

  return (
    <form action={create} className="space-y-3">
      <div className="text-lg font-semibold">New Entity</div>

      <label className="block text-sm text-slate-300">Type</label>
      <select name="type" className="w-full rounded-xl bg-white/5 border border-white/10 p-3">
        <option value="PERSON">Person</option>
        <option value="ORG">Organisation</option>
        <option value="LOCATION">Location</option>
        <option value="EVENT">Event</option>
        <option value="IDENTIFIER">Identifier</option>
      </select>

      <label className="block text-sm text-slate-300">Name</label>
      <input name="name" className="w-full rounded-xl bg-white/5 border border-white/10 p-3" placeholder="e.g. Company A / Jane Doe" />

      <button className="w-full rounded-xl bg-white text-black py-3 font-semibold">
        Create
      </button>
    </form>
  );
}
