import PostsPage from "../../posts/page";

export const dynamic = "force-dynamic";

interface EsPostsPageProps {
  searchParams: {
    search?: string;
    tag?: string;
    lang?: string;
  };
}

export default async function EsPostsPage(props: EsPostsPageProps) {
  return <PostsPage searchParams={{ ...props.searchParams, lang: "es" }} />;
}
