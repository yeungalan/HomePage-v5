import { notFound } from 'next/navigation';
import { RealFooter } from '@/components/FooterLinks';
import Post from '@/components/Post';
import { promises as fs } from 'fs';
import path from 'path';

// Force dynamic rendering (SSR)
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getMarkdownContent(slug: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'posts_md', `${slug}.md`);
    const content = await fs.readFile(filePath, 'utf8');
    return content;
  } catch (error) {
    console.error(`Error loading markdown for slug "${slug}":`, error);
    return null;
  }
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = params;

  // Fetch markdown content on the server
  const markdownContent = await getMarkdownContent(slug);

  // If markdown file doesn't exist, return 404
  if (!markdownContent) {
    notFound();
  }

  return (
    <div className="relative">
      <Post markdownContent={markdownContent} />
      <RealFooter />
    </div>
  );
}
