import { getArchiveIndex } from "@/lib/content";
import ArchiveList from "./ArchiveList";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const index = await getArchiveIndex();

  return (
    <main className="forge-shell">
      <span className="forge-eyebrow">THE ARCHIVE</span>
      <h1 className="forge-title">These works did not survive.</h1>
      <p className="forge-lead">
        Rejection is not insult. It is classification. Study what collapses and
        learn where structure ends.
      </p>

      <ArchiveList items={index.items} />
    </main>
  );
}

