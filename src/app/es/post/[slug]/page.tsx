import PostPage from "../../../post/[slug]/page";
import { generatePostMetadata } from "@/lib/post-helpers";

interface LangPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(props: LangPostPageProps) {
  return generatePostMetadata(props.params.slug, "es");
}

export default async function EsPostPage(props: LangPostPageProps) {
  return PostPage(props, "es");
}

