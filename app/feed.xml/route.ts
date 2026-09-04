import { getPostBySlug, getPostSummaries } from "@/lib/posts";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const SITE_TITLE = "Scribes — Burhan";
const SITE_DESCRIPTION = "I write about technology and life.";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return new Date().toUTCString();
  return parsed.toUTCString();
}

/* ------------------------------------------------------------------ */
/* Notion blocks -> HTML (for full-content RSS)                       */
/* ------------------------------------------------------------------ */

type RT = { plain_text?: string; href?: string | null; annotations?: { bold?: boolean; italic?: boolean; strikethrough?: boolean; underline?: boolean; code?: boolean } };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Block = Record<string, any>;

function richTextToHtml(richText: RT[] | undefined): string {
  if (!richText || richText.length === 0) return "";
  return richText
    .map((item) => {
      let text = escapeXml(item.plain_text || "");
      const a = item.annotations;
      if (a?.bold) text = `<strong>${text}</strong>`;
      if (a?.italic) text = `<em>${text}</em>`;
      if (a?.strikethrough) text = `<s>${text}</s>`;
      if (a?.underline) text = `<u>${text}</u>`;
      if (a?.code) text = `<code>${text}</code>`;
      if (item.href) {
        text = `<a href="${escapeXml(item.href)}">${text}</a>`;
      }
      return text;
    })
    .join("");
}

function blockToHtml(block: Block, depth: number = 0): string {
  const type = block.type;
  const data = block[type] || {};
  const inner = (children: unknown) => childrenToHtml(children as Block[] | undefined, depth + 1);
  const rich = richTextToHtml(data.rich_text);

  switch (type) {
    case "paragraph":
      return `<p>${rich}${inner(block.children)}</p>`;
    case "heading_1":
      return `<h1>${rich}</h1>`;
    case "heading_2":
      return `<h2>${rich}</h2>`;
    case "heading_3":
      return `<h3>${rich}</h3>`;
    case "bulleted_list_item":
      return `<li>${rich}${inner(block.children)}</li>`;
    case "numbered_list_item":
      return `<li>${rich}${inner(block.children)}</li>`;
    case "to_do":
      return `<li><input type="checkbox"${data.checked ? " checked" : ""} disabled/> ${rich}${inner(block.children)}</li>`;
    case "quote":
      return `<blockquote>${rich}${inner(block.children)}</blockquote>`;
    case "callout":
      return `<blockquote>${data.icon?.emoji ? data.icon.emoji + " " : ""}${rich}${inner(block.children)}</blockquote>`;
    case "code": {
      const code = (data.rich_text || []).map((t: RT) => t.plain_text || "").join("");
      return `<pre><code>${escapeXml(code)}</code></pre>`;
    }
    case "divider":
      return `<hr/>`;
    case "image": {
      const url = data.file?.url || data.external?.url;
      const alt = (data.caption || []).map((c: RT) => c.plain_text || "").join("");
      return url ? `<img src="${escapeXml(url)}" alt="${escapeXml(alt)}"/>` : "";
    }
    case "video": {
      const url = data.external?.url || data.file?.url;
      return url ? `<p><a href="${escapeXml(url)}">${escapeXml(url)}</a></p>` : "";
    }
    case "equation":
      return `<p>${escapeXml(data.expression || "")}</p>`;
    case "table":
      return `<table>${inner(block.children)}</table>`;
    case "table_row": {
      const cells = (data.cells || []).map((cell: RT[]) => `<td>${richTextToHtml(cell)}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }
    case "column_list":
      return inner(block.children);
    case "column":
      return inner(block.children);
    case "synced_block":
      return inner(block.children);
    default:
      return "";
  }
}

function childrenToHtml(blocks: Block[] | undefined, depth: number = 0): string {
  if (!blocks || blocks.length === 0) return "";
  const out: string[] = [];
  let bullet: string[] = [];
  let numbered: string[] = [];

  const flushBullet = () => {
    if (bullet.length) {
      out.push(`<ul>${bullet.join("")}</ul>`);
      bullet = [];
    }
  };
  const flushNumbered = () => {
    if (numbered.length) {
      out.push(`<ol>${numbered.join("")}</ol>`);
      numbered = [];
    }
  };

  for (const block of blocks) {
    if (!block?.type) continue;
    if (block.type === "bulleted_list_item") {
      flushNumbered();
      bullet.push(blockToHtml(block, depth));
    } else if (block.type === "numbered_list_item") {
      flushBullet();
      numbered.push(blockToHtml(block, depth));
    } else {
      flushBullet();
      flushNumbered();
      const html = blockToHtml(block, depth);
      if (html) out.push(html);
    }
  }
  flushBullet();
  flushNumbered();

  return out.join("");
}

export async function GET() {
  const summaries = await getPostSummaries();

  const items = [];
  for (const summary of summaries) {
    const post = await getPostBySlug(summary.slug);
    if (!post) continue;

    const link = `${SITE_URL}/blog/${post.slug}`;
    const categories = (post.tags || [])
      .map((tag) => `      <category>${escapeXml(tag)}</category>`)
      .join("\n");
    const body =
      childrenToHtml(post.blocks as Block[]) || `<p>${escapeXml(post.excerpt || "")}</p>`;

    items.push(`    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="false">${escapeXml(link)}</guid>
      <pubDate>${toRfc822(post.date)}</pubDate>
      <description><![CDATA[${body}]]></description>
${categories}    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(`${SITE_URL}/feed.xml`)}" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
