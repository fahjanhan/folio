export interface Post {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  blocks: NotionBlock[];
  readingTime: number;
  tags: string[];
  published: boolean;
}

export interface NotionBlock {
  type: string;
  id: string;
  [key: string]: unknown;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function extractRichText(richText: Array<{ plain_text: string }>): string {
  return richText.map((block) => block.plain_text).join("");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getAllBlocks(notion: any, blockId: string): Promise<NotionBlock[]> {
  let blocks: NotionBlock[] = [];
  let cursor: string | undefined = undefined;

  // 1. Paginate through ALL children at this level.
  //    Notion caps each response (default/max page_size=100), so has_more/
  //    next_cursor must be followed or long posts get truncated.
  do {
    const query = new URLSearchParams({ page_size: "100" });
    if (cursor) query.set("start_cursor", cursor);

    const response = (await notion.request({
      method: "get",
      path: `blocks/${blockId}/children?${query.toString()}`,
    })) as { results: NotionBlock[]; has_more: boolean; next_cursor: string | null };

    blocks = blocks.concat(response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  // 2. Recursively fetch children for any block that has them
  //    (toggles, nested bullet/numbered lists, columns, synced blocks, etc.)
  //    has_children=true does NOT include the nested content inline.
  for (const block of blocks) {
    if ((block as { has_children?: boolean }).has_children) {
      (block as Record<string, unknown>).children = await getAllBlocks(notion, block.id);
    }
  }

  return blocks;
}

export async function getPosts(): Promise<Post[]> {
  const notionApiKey = process.env.NOTION_API_KEY;
  const notionDatabaseId = process.env.NOTION_DATABASE_ID;

  if (!notionApiKey || !notionDatabaseId) {
    return getPlaceholderPosts();
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { Client } = require("@notionhq/client");
    const notion = new Client({
      auth: notionApiKey,
      notionVersion: "2025-09-03",
        fetch: (url: RequestInfo | URL, init?: RequestInit) =>
    fetch(url, { ...init, cache: "no-store" }),
    });

    const databaseResponse = (await notion.request({
      method: "get",
      path: `databases/${notionDatabaseId}`,
    })) as { data_sources: Array<{ id: string }> };

    const dataSourceId = databaseResponse.data_sources?.[0]?.id;

    if (!dataSourceId) {
      return getPlaceholderPosts();
    }

    const response = (await notion.request({
      method: "post",
      path: `data_sources/${dataSourceId}/query`,
      body: {
        filter: {
          property: "Published",
          checkbox: { equals: true },
        },
        sorts: [
          {
            property: "Date",
            direction: "descending",
          },
        ],
      },
    })) as { results: Array<{ id: string; properties: Record<string, unknown> }> };

    const pageIds = response.results.map((page) => page.id);

    // Use the recursive, paginating fetcher instead of a single request
    const allBlocks = await Promise.all(
      pageIds.map((id) => getAllBlocks(notion, id).catch(() => [] as NotionBlock[]))
    );

    const posts: Post[] = [];

    for (let i = 0; i < response.results.length; i++) {
      const page = response.results[i];
      const blocks = allBlocks[i];
      const props = page.properties as Record<string, unknown>;

      const titleProp = props.Name as { title?: Array<{ plain_text: string }> };
      const title = extractRichText(titleProp?.title || []);

      if (!title) continue;

      const slugProp = props.Slug as { rich_text?: Array<{ plain_text: string }> };
      const slug =
        slugProp?.rich_text?.[0]?.plain_text ||
        title.toLowerCase().replace(/\s+/g, "-");

      const dateProp = props.Date as { date?: { start?: string } };
      const dateStr = dateProp?.date?.start || new Date().toISOString();

      const excerptProp = props.Excerpt as {
        rich_text?: Array<{ plain_text: string }>;
      };
      const excerpt = excerptProp?.rich_text?.[0]?.plain_text || "";

      const tagsProp = props.Tags as {
        multi_select?: Array<{ name: string }>;
      };
      const tags = tagsProp?.multi_select?.map((t) => t.name) || [];

      const wordCount = blocks.reduce((count, block) => {
        const blockData = block[block.type] as { rich_text?: Array<{ plain_text: string }> };
        if (blockData?.rich_text) {
          return count + extractRichText(blockData.rich_text).split(/\s+/).length;
        }
        return count;
      }, 0);
      const readingTime = Math.max(1, Math.ceil(wordCount / 200));

      posts.push({
        id: page.id,
        slug,
        title,
        date: formatDate(new Date(dateStr)),
        excerpt,
        blocks,
        readingTime,
        tags,
        published: true,
      });
    }

    return posts;
  } catch (error) {
    console.error("Error fetching from Notion:", error);
    return getPlaceholderPosts();
  }
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const posts = await getPosts();
  return posts.find((post) => post.slug === slug) || null;
}

// getPlaceholderPosts() unchanged — keep as-is

function getPlaceholderPosts(): Post[] {
  return [
    {
      id: "1",
      slug: "hello-world",
      title: "Hello World",
      date: formatDate(new Date("2026-03-30")),
      excerpt: "My first post on this minimal portfolio.",
      blocks: [
        {
          type: "paragraph",
          id: "1",
          paragraph: {
            rich_text: [
              {
                plain_text: "Welcome to my blog! This is where I'll share my thoughts, projects, and ideas.",
                annotations: { bold: false, italic: false },
              },
            ],
          },
        },
        {
          type: "paragraph",
          id: "2",
          paragraph: {
            rich_text: [
              {
                plain_text: "Stay tuned for more content as I explore topics around ",
                annotations: { bold: false, italic: false },
              },
              {
                plain_text: "web development",
                annotations: { bold: true, italic: false },
              },
              {
                plain_text: ", ",
                annotations: { bold: false, italic: false },
              },
              {
                plain_text: "design",
                annotations: { bold: false, italic: true },
              },
              {
                plain_text: ", and technology.",
                annotations: { bold: false, italic: false },
              },
            ],
          },
        },
      ],
      readingTime: 1,
      tags: ["intro"],
      published: true,
    },
    {
      id: "2",
      slug: "minimal-design",
      title: "The Beauty of Minimal Design",
      date: formatDate(new Date("2026-03-29")),
      excerpt: "Why less is often more when it comes to web design.",
      blocks: [
        {
          type: "paragraph",
          id: "1",
          paragraph: {
            rich_text: [
              {
                plain_text: "Minimal design isn't about removing things—it's about ",
                annotations: { bold: false, italic: false },
              },
              {
                plain_text: "keeping only what matters",
                annotations: { bold: true, italic: true },
              },
              {
                plain_text: ".",
                annotations: { bold: false, italic: false },
              },
            ],
          },
        },
        {
          type: "paragraph",
          id: "2",
          paragraph: {
            rich_text: [
              {
                plain_text: "Every element should serve a purpose. Clean spaces let the content breathe and help users focus on what's important.",
                annotations: { bold: false, italic: false },
              },
            ],
          },
        },
        {
          type: "heading_2",
          id: "3",
          heading_2: {
            rich_text: [
              {
                plain_text: "Key principles",
                annotations: { bold: false, italic: false },
              },
            ],
          },
        },
        {
          type: "bulleted_list_item",
          id: "4",
          bulleted_list_item: {
            rich_text: [
              { plain_text: "Remove visual noise", annotations: {} },
            ],
          },
        },
        {
          type: "bulleted_list_item",
          id: "5",
          bulleted_list_item: {
            rich_text: [
              { plain_text: "Use whitespace strategically", annotations: {} },
            ],
          },
        },
        {
          type: "bulleted_list_item",
          id: "6",
          bulleted_list_item: {
            rich_text: [
              { plain_text: "Focus on typography", annotations: {} },
            ],
          },
        },
        {
          type: "quote",
          id: "7",
          quote: {
            rich_text: [
              {
                plain_text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.",
                annotations: { italic: true },
              },
            ],
          },
        },
        {
          type: "code",
          id: "8",
          code: {
            language: "css",
            rich_text: [
              {
                plain_text: ".minimal {\n  padding: 0;\n  margin: 0;\n  /* Less is more */\n}",
                annotations: {},
              },
            ],
          },
        },
      ],
      readingTime: 2,
      tags: ["design", "ui"],
      published: true,
    },
  ];
}
