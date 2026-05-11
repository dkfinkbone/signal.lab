import { notFound } from "next/navigation";
import { ARTICLE_SELECT_COLUMNS } from "@/lib/article-write";
import { getServiceClient } from "@/lib/supabase-service";
import ArticleEditor from "@/components/ArticleEditor";
import type { Article } from "@/types";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: Props) {
  const { id } = await params;

  if (id === "new") {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">New Article</h1>
        <ArticleEditor isNew />
      </>
    );
  }

  const client = getServiceClient();
  const { data } = await client
    .from("articles")
    .select(ARTICLE_SELECT_COLUMNS)
    .eq("id", id)
    .single();
  const article = data as Article | null;

  if (!article) notFound();

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold truncate max-w-lg">{article.headline}</h1>
        <div className="flex gap-3 text-xs text-gray-400">
          <a href={`/insights/${article.slug}`} target="_blank" className="hover:text-blue-500">
            View article ↗
          </a>
          <a href={`/agent-read/${article.slug}`} target="_blank" className="hover:text-blue-500">
            Agent-read ↗
          </a>
        </div>
      </div>
      <ArticleEditor article={article} />
    </>
  );
}
