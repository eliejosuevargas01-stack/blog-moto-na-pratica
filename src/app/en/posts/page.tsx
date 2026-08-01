import PostsPage from "../../posts/page";

export const dynamic = "force-dynamic";

interface EnPostsPageProps {
  searchParams: {
    search?: string;
    tag?: string;
    lang?: string;
  };
}

export default async function EnPostsPage(props: EnPostsPageProps) {
  return <PostsPage searchParams={{ ...props.searchParams, lang: "en" }} />;
}
