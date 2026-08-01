import PostsPage from "../posts/page";

export const dynamic = "force-dynamic";

interface PostIndexPageProps {
  searchParams: {
    search?: string;
    tag?: string;
    lang?: string;
  };
}

export default async function PostIndexPage(props: PostIndexPageProps) {
  return <PostsPage {...props} />;
}
