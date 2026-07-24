import PostPage, { generateMetadata as baseGenerateMetadata } from "../../../post/[slug]/page";

interface LangPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata(props: LangPostPageProps) {
  return baseGenerateMetadata(props);
}

export default async function EsPostPage(props: LangPostPageProps) {
  return PostPage(props);
}
