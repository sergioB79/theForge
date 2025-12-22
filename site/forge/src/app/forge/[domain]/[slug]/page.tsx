import { getForgeIndex, getForgeItemBySlug, readForgeMarkdown } from "@/lib/content";
import { parseForgeMarkdown } from "@/lib/forgeParse";
import ForgeDocView from "@/components/Forge/ForgeDocView";

type PageProps = {
  params: Promise<{ domain: string; slug: string }>;
};

export default async function ForgeReviewPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getForgeItemBySlug(slug);

  if (!item) {
    return (
      <main className="forge-shell">
        <h1 className="forge-title">Item not found.</h1>
      </main>
    );
  }

  const mdText = await readForgeMarkdown(item.sourcePath);

  const doc = parseForgeMarkdown(mdText);
  if (!mdText) {
    doc.bodyIntro = "No content found.";
  }

  const index = await getForgeIndex();
  const tagSet = new Set(item.tags || []);
  const suggestions = index.items
    .filter((candidate) => candidate.slug !== item.slug)
    .map((candidate) => {
      const shared = candidate.tags
        ? candidate.tags.filter((t) => tagSet.has(t)).length
        : 0;
      return { candidate, shared };
    })
    .filter((entry) => entry.shared > 0)
    .sort((a, b) => b.shared - a.shared)
    .slice(0, 2)
    .map((entry) => ({
      title: entry.candidate.title,
      url: `/forge/${entry.candidate.domain}/${entry.candidate.slug}`,
      category: entry.candidate.category,
      level: entry.candidate.level,
      subtitle: entry.candidate.subtitle,
    }));

  return <ForgeDocView doc={doc} suggestions={suggestions} />;
}
