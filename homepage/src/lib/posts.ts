import fs from 'fs';
import path from 'path';

export interface Post {
  id: string;
  title: string;
  slug: string;
  created: string;
  baseSlug: string;
  language: string;
  availableLanguages: string[];
  allTitles: Record<string, string>; // Map of language -> title
}

export interface PostWithContent extends Post {
  content: string;
}

/**
 * Parse language code from filename
 * Examples: "aboutme_en" -> { baseSlug: "aboutme", language: "en" }
 *           "aboutme" -> { baseSlug: "aboutme", language: "default" }
 */
export function parseSlugLanguage(slug: string): { baseSlug: string; language: string } {
  const match = slug.match(/^(.+)_([a-z]{2})$/);
  if (match) {
    return { baseSlug: match[1], language: match[2] };
  }
  return { baseSlug: slug, language: 'default' };
}

/**
 * Get all posts from the posts_md directory
 * Extracts metadata from AUTOMATE FIELD section in markdown files
 * Groups posts by base slug and detects available languages
 * Sorts posts by creation date (newest first)
 */
export async function getPosts(): Promise<PostWithContent[]> {
  const postsDirectory = path.join(process.cwd(), 'public/posts_md');
  const filenames = fs.readdirSync(postsDirectory);

  // First pass: collect all posts with their metadata
  const allPosts = filenames
    .filter((filename) => filename.endsWith('.md'))
    .map((filename, index) => {
      const filePath = path.join(postsDirectory, filename);
      const fileContents = fs.readFileSync(filePath, 'utf8');

      // Extract metadata from AUTOMATE FIELD section
      const automateFieldMatch = fileContents.match(
        /###\s*AUTOMATE FIELD\s*([\s\S]*?)###\s*AUTOMATE FIELD END/
      );
      let createdDate = '1900-01-01';
      let title = filename.replace(/\.md$/, '');

      if (automateFieldMatch) {
        const automateSection = automateFieldMatch[1];
        const createdDateMatch = automateSection.match(/CREATED_DATE\s*=\s*(.+?)[\r\n]/);
        const topicMatch = automateSection.match(/Topic\s*=\s*(.+?)[\r\n]/);

        if (createdDateMatch) {
          createdDate = createdDateMatch[1].trim();
        }
        if (topicMatch) {
          title = topicMatch[1].trim();
        }
      }

      const slug = filename.replace(/\.md$/, '');
      const { baseSlug, language } = parseSlugLanguage(slug);

      return {
        id: String(index + 1),
        title: title || slug,
        slug: slug,
        created: createdDate,
        baseSlug,
        language,
        availableLanguages: [] as string[],
        allTitles: {} as Record<string, string>,
        content: fileContents,
      };
    });

  // Group posts by base slug to find available languages
  const postsByBase = new Map<string, PostWithContent[]>();
  for (const post of allPosts) {
    const existing = postsByBase.get(post.baseSlug) || [];
    existing.push(post);
    postsByBase.set(post.baseSlug, existing);
  }

  // Add available languages and all titles to each post
  for (const posts of postsByBase.values()) {
    const languages = posts.map((p) => p.language);
    const allTitles: Record<string, string> = {};

    // Collect all titles from different language versions
    for (const post of posts) {
      allTitles[post.language] = post.title;
    }

    for (const post of posts) {
      post.availableLanguages = languages;
      post.allTitles = allTitles;
    }
  }

  // Filter to show only one version per base slug (prefer default language)
  const uniquePosts = Array.from(postsByBase.values()).map((posts) => {
    const defaultPost = posts.find((p) => p.language === 'default');
    return defaultPost || posts[0];
  });

  // Sort by creation date (newest first)
  return uniquePosts.sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );
}

/**
 * Get a specific post by slug with its content and available languages
 */
export async function getPostBySlug(slug: string): Promise<PostWithContent | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'posts_md', `${slug}.md`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract metadata
    const automateFieldMatch = content.match(
      /###\s*AUTOMATE FIELD\s*([\s\S]*?)###\s*AUTOMATE FIELD END/
    );
    let createdDate = '1900-01-01';
    let title = slug;

    if (automateFieldMatch) {
      const automateSection = automateFieldMatch[1];
      const createdDateMatch = automateSection.match(/CREATED_DATE\s*=\s*(.+?)[\r\n]/);
      const topicMatch = automateSection.match(/Topic\s*=\s*(.+?)[\r\n]/);

      if (createdDateMatch) {
        createdDate = createdDateMatch[1].trim();
      }
      if (topicMatch) {
        title = topicMatch[1].trim();
      }
    }

    const { baseSlug, language } = parseSlugLanguage(slug);

    // Find all available languages for this post
    const postsDirectory = path.join(process.cwd(), 'public/posts_md');
    const filenames = fs.readdirSync(postsDirectory);
    const availableLanguages: string[] = [];
    const allTitles: Record<string, string> = {};

    for (const filename of filenames) {
      if (!filename.endsWith('.md')) continue;
      const fileSlug = filename.replace(/\.md$/, '');
      const { baseSlug: fileBase, language: fileLang } = parseSlugLanguage(fileSlug);
      if (fileBase === baseSlug) {
        availableLanguages.push(fileLang);

        // Extract title for this language version
        const langFilePath = path.join(postsDirectory, filename);
        const langContent = fs.readFileSync(langFilePath, 'utf8');
        const langAutomateMatch = langContent.match(
          /###\s*AUTOMATE FIELD\s*([\s\S]*?)###\s*AUTOMATE FIELD END/
        );
        let langTitle = fileSlug;
        if (langAutomateMatch) {
          const langSection = langAutomateMatch[1];
          const langTopicMatch = langSection.match(/Topic\s*=\s*(.+?)[\r\n]/);
          if (langTopicMatch) {
            langTitle = langTopicMatch[1].trim();
          }
        }
        allTitles[fileLang] = langTitle;
      }
    }

    return {
      id: slug,
      title,
      slug,
      created: createdDate,
      baseSlug,
      language,
      availableLanguages,
      allTitles,
      content,
    };
  } catch (error) {
    console.error(`Error loading post "${slug}":`, error);
    return null;
  }
}

/**
 * Get preferred language based on browser preferences and available languages
 */
export function getPreferredLanguage(
  availableLanguages: string[],
  browserLanguages: string[]
): string {
  // Check if any browser language matches available languages
  for (const browserLang of browserLanguages) {
    // Extract base language code (e.g., "en-US" -> "en")
    const baseLang = browserLang.split('-')[0].toLowerCase();
    if (availableLanguages.includes(baseLang)) {
      return baseLang;
    }
  }

  // Fallback to default language if available
  if (availableLanguages.includes('default')) {
    return 'default';
  }

  // Otherwise return first available language
  return availableLanguages[0] || 'default';
}
