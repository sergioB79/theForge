import { getArchiveIndex, getForgeIndex } from "@/lib/content";
import CrucibleView from "@/components/Crucible/CrucibleView";

export const dynamic = "force-dynamic";

export default async function CruciblePage() {
  const index = await getForgeIndex();
  const archive = await getArchiveIndex();
  const rejectedByDomain = archive.items.reduce<Record<string, number>>((acc, item) => {
    acc[item.domain] = (acc[item.domain] || 0) + 1;
    return acc;
  }, {});

  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">THE CRUCIBLE</span>
      <h1 className="forge-title">These works passed.</h1>
      <p className="forge-lead">
        Not because they are loved. Not because they are important. But because
        something survived the fire.
      </p>

      <CrucibleView items={index.items} rejectedByDomain={rejectedByDomain} />
    </main>
  );
}
