// "use client";

// import { Fragment } from "react";

// type RichTextItem = {
//   plain_text: string;
//   href?: string | null;
//   annotations?: {
//     bold?: boolean;
//     italic?: boolean;
//     strikethrough?: boolean;
//     underline?: boolean;
//     code?: boolean;
//   };
// };

// type Block = {
//   type: string;
//   id: string;
//   [key: string]: unknown;
// };

// function renderRichText(richText: RichTextItem[]) {
//   return richText.map((item, index) => {
//     let content: React.ReactNode = item.plain_text;

//     if (item.annotations?.code) {
//       content = (
//         <code
//           key={index}
//           className="px-1.5 py-0.5 bg-muted/20 text-fg rounded text-sm font-mono"
//         >
//           {content}
//         </code>
//       );
//     } else {
//       if (item.annotations?.bold) {
//         content = <strong key={index}>{content}</strong>;
//       }
//       if (item.annotations?.italic) {
//         content = <em key={index}>{content}</em>;
//       }
//       if (item.annotations?.strikethrough) {
//         content = <s key={index}>{content}</s>;
//       }
//       if (item.annotations?.underline) {
//         content = <u key={index}>{content}</u>;
//       }
//     }

//     if (item.href) {
//       content = (
//         <a
//           key={index}
//           href={item.href}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="underline hover:opacity-70"
//         >
//           {content}
//         </a>
//       );
//     }

//     return <Fragment key={index}>{content}</Fragment>;
//   });
// }

// function renderBlock(block: Block): React.ReactNode {
//   const type = block.type;
//   const id = block.id;
//   const data = block[type] as { rich_text?: RichTextItem[]; caption?: RichTextItem[] };

//   switch (type) {
//     case "paragraph":
//       if (!data.rich_text?.length) return <br key={id} />;
//       return (
//         <p key={id} className="mb-4 leading-relaxed">{renderRichText(data.rich_text)}</p>
//       );

//     case "heading_1":
//       return (
//         <h1 key={id} className="text-2xl font-bold mt-8 mb-4">
//           {renderRichText(data.rich_text || [])}
//         </h1>
//       );

//     case "heading_2":
//       return (
//         <h2 key={id} className="text-xl font-bold mt-6 mb-3">
//           {renderRichText(data.rich_text || [])}
//         </h2>
//       );

//     case "heading_3":
//       return (
//         <h3 key={id} className="text-lg font-semibold mt-4 mb-2">
//           {renderRichText(data.rich_text || [])}
//         </h3>
//       );

//     case "bulleted_list_item":
//       return (
//         <li key={id} className="ml-4 mb-1">{renderRichText(data.rich_text || [])}</li>
//       );

//     case "numbered_list_item":
//       return (
//         <li key={id} className="ml-4 mb-1 list-decimal">
//           {renderRichText(data.rich_text || [])}
//         </li>
//       );

//     case "to_do":
//       const todoData = data as { rich_text?: RichTextItem[]; checked?: boolean };
//       return (
//         <div key={id} className="flex items-start gap-2 mb-1">
//           <input
//             type="checkbox"
//             checked={todoData.checked || false}
//             readOnly
//             className="mt-1 accent-fg"
//           />
//           <span className={todoData.checked ? "line-through opacity-60" : ""}>
//             {renderRichText(todoData.rich_text || [])}
//           </span>
//         </div>
//       );

//     case "toggle":
//       const toggleData = data as { rich_text?: RichTextItem[] };
//       return (
//         <details key={id} className="mb-2 border border-border rounded p-2">
//           <summary className="cursor-pointer font-medium">
//             {renderRichText(toggleData.rich_text || [])}
//           </summary>
//         </details>
//       );

//     case "code":
//       const codeData = data as { rich_text?: RichTextItem[]; language?: string };
//       const code = codeData.rich_text?.map((t) => t.plain_text).join("") || "";
//       return (
//         <pre key={id} className="bg-muted/10 border border-border rounded p-4 overflow-x-auto mb-4 font-mono text-sm">
//           <code>{code}</code>
//         </pre>
//       );

//     case "quote":
//       return (
//         <blockquote key={id} className="border-l-2 border-muted pl-4 italic text-muted mb-4">
//           {renderRichText(data.rich_text || [])}
//         </blockquote>
//       );

//     case "callout":
//       const calloutData = data as {
//         rich_text?: RichTextItem[];
//         icon?: { type: string; emoji?: string };
//       };
//       return (
//         <div key={id} className="flex items-start gap-3 bg-muted/10 border border-border rounded p-4 mb-4">
//           {calloutData.icon?.emoji && (
//             <span className="text-lg">{calloutData.icon.emoji}</span>
//           )}
//           <div>{renderRichText(calloutData.rich_text || [])}</div>
//         </div>
//       );

//     case "divider":
//       return <hr key={id} className="border-border my-8" />;

//     case "image":
//       const imageData = data as {
//         type: string;
//         file?: { url: string };
//         external?: { url: string };
//         caption?: RichTextItem[];
//       };
//       const imageUrl = imageData.file?.url || imageData.external?.url;
//       if (!imageUrl) return null;
//       return (
//         <figure key={id} className="my-6">
//           <img
//             src={imageUrl}
//             alt={imageData.caption?.map((c) => c.plain_text).join("") || ""}
//             className="w-full rounded border border-border"
//           />
//           {imageData.caption && imageData.caption.length > 0 && (
//             <figcaption className="text-center text-xs text-muted mt-2">
//               {renderRichText(imageData.caption)}
//             </figcaption>
//           )}
//         </figure>
//       );

//     case "video":
//       const videoData = data as {
//         type: string;
//         external?: { url: string };
//         file?: { url: string };
//       };
//       const videoUrl = videoData.external?.url || videoData.file?.url;
//       if (!videoUrl) return null;
//       return (
//         <div key={id} className="my-6 aspect-video">
//           <iframe
//             src={videoUrl}
//             className="w-full h-full rounded border border-border"
//             allowFullScreen
//           />
//         </div>
//       );

//     case "bookmark": {
//       const bookmarkData = data as { url: string; caption?: RichTextItem[] };
//       const caption = bookmarkData.caption || [];
//       return (
//         <a
//           key={id}
//           href={bookmarkData.url}
//           target="_blank"
//           rel="noopener noreferrer"
//           className="block border border-border rounded p-3 mb-4 hover:bg-muted/5 transition-colors"
//         >
//           <p className="text-sm font-medium truncate">{bookmarkData.url}</p>
//           {caption.length > 0 && (
//             <p className="text-xs text-muted mt-1">
//               {renderRichText(caption)}
//             </p>
//           )}
//         </a>
//       );
//     }

//     case "table_of_contents":
//       return null;

//     case "column_list":
//     case "column":
//       return null;

//     default:
//       return null;
//   }
// }

// function groupListItems(blocks: Block[]): React.ReactNode[] {
//   const result: React.ReactNode[] = [];
//   let bulletList: React.ReactNode[] = [];
//   let numberedList: React.ReactNode[] = [];

//   const flushBulletList = () => {
//     if (bulletList.length > 0) {
//       result.push(<ul key={`ul-${result.length}`} className="mb-4">{bulletList}</ul>);
//       bulletList = [];
//     }
//   };

//   const flushNumberedList = () => {
//     if (numberedList.length > 0) {
//       result.push(<ol key={`ol-${result.length}`} className="mb-4">{numberedList}</ol>);
//       numberedList = [];
//     }
//   };

//   for (const block of blocks) {
//     if (block.type === "bulleted_list_item") {
//       flushNumberedList();
//       bulletList.push(renderBlock(block));
//     } else if (block.type === "numbered_list_item") {
//       flushBulletList();
//       numberedList.push(renderBlock(block));
//     } else {
//       flushBulletList();
//       flushNumberedList();
//       const rendered = renderBlock(block);
//       if (rendered) {
//         result.push(rendered);
//       }
//     }
//   }

//   flushBulletList();
//   flushNumberedList();

//   return result;
// }

// interface NotionRendererProps {
//   blocks: Block[];
// }

// export function NotionRenderer({ blocks }: NotionRendererProps) {
//   return <>{groupListItems(blocks)}</>;
// }


"use client";

import { Fragment, useState } from "react";

type RichTextItem = {
  plain_text: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
};

type Block = {
  type: string;
  id: string;
  has_children?: boolean;
  children?: Block[];
  [key: string]: unknown;
};

/* ------------------------------------------------------------------ */
/* Rich text                                                          */
/* ------------------------------------------------------------------ */

const NOTION_TEXT_COLORS: Record<string, string> = {
  gray: "text-gray-500",
  brown: "text-amber-700",
  orange: "text-orange-500",
  yellow: "text-yellow-500",
  green: "text-green-600",
  blue: "text-blue-500",
  purple: "text-purple-500",
  pink: "text-pink-500",
  red: "text-red-500",
};

function renderRichText(richText: RichTextItem[] | undefined) {
  if (!richText || richText.length === 0) return null;

  return richText.map((item, index) => {
    let content: React.ReactNode = item.plain_text;

    if (item.annotations?.code) {
      content = (
        <code
          key={index}
          className="px-1.5 py-0.5 bg-muted/20 text-fg rounded text-sm font-mono"
        >
          {content}
        </code>
      );
    } else {
      if (item.annotations?.bold) content = <strong key={index}>{content}</strong>;
      if (item.annotations?.italic) content = <em key={index}>{content}</em>;
      if (item.annotations?.strikethrough) content = <s key={index}>{content}</s>;
      if (item.annotations?.underline) content = <u key={index}>{content}</u>;
    }

    const colorClass =
      item.annotations?.color && item.annotations.color !== "default"
        ? NOTION_TEXT_COLORS[item.annotations.color.replace("_background", "")]
        : undefined;

    if (colorClass) {
      content = <span key={index} className={colorClass}>{content}</span>;
    }

    if (item.href) {
      content = (
        <a
          key={index}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:opacity-70"
        >
          {content}
        </a>
      );
    }

    return <Fragment key={index}>{content}</Fragment>;
  });
}

/* ------------------------------------------------------------------ */
/* Image with lazy-load, skeleton, size cap, and error fallback       */
/* ------------------------------------------------------------------ */

function NotionImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="w-full aspect-video bg-muted/10 border border-border rounded flex items-center justify-center text-xs text-muted">
        Image failed to load
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {!loaded && (
        <div className="absolute inset-0 bg-muted/10 animate-pulse rounded" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt || "Blog post image"}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`w-full max-h-[70vh] object-contain transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Block rendering                                                    */
/* ------------------------------------------------------------------ */

function renderChildren(children: Block[] | undefined): React.ReactNode {
  if (!children || children.length === 0) return null;
  return groupListItems(children);
}

function renderToggleableHeading(
  block: Block,
  level: 1 | 2 | 3,
  data: { rich_text?: RichTextItem[]; is_toggleable?: boolean }
) {
  const sizeClass =
    level === 1
      ? "text-2xl font-bold mt-8 mb-4"
      : level === 2
      ? "text-xl font-bold mt-6 mb-3"
      : "text-lg font-semibold mt-4 mb-2";

  if (data.is_toggleable) {
    return (
      <details key={block.id} className="group mb-2">
        <summary className={`${sizeClass} cursor-pointer select-none inline-block`}>
          {renderRichText(data.rich_text)}
        </summary>
        {block.children && (
          <div className="mt-2 pl-4 border-l border-border">
            {renderChildren(block.children)}
          </div>
        )}
      </details>
    );
  }

  const Tag = (`h${level}` as unknown) as "h1" | "h2" | "h3";
  return (
    <Tag key={block.id} className={sizeClass}>
      {renderRichText(data.rich_text)}
    </Tag>
  );
}

function renderBlockInner(block: Block): React.ReactNode {
  const type = block.type;
  const id = block.id;
  const data = block[type] as {
    rich_text?: RichTextItem[];
    caption?: RichTextItem[];
    [key: string]: unknown;
  };

  switch (type) {
    case "paragraph":
      if (!data.rich_text?.length) return <br key={id} />;
      return (
        <div key={id} className="mb-4 leading-relaxed">
          <p>{renderRichText(data.rich_text)}</p>
          {block.children && (
            <div className="mt-2 pl-4 border-l border-border">
              {renderChildren(block.children)}
            </div>
          )}
        </div>
      );

    case "heading_1":
      return renderToggleableHeading(block, 1, data);
    case "heading_2":
      return renderToggleableHeading(block, 2, data);
    case "heading_3":
      return renderToggleableHeading(block, 3, data);

    case "bulleted_list_item":
      return (
        <li key={id} className="ml-4 mb-1">
          {renderRichText(data.rich_text)}
          {block.children && (
            <div className="mt-1 pl-4">{renderChildren(block.children)}</div>
          )}
        </li>
      );

    case "numbered_list_item":
      return (
        <li key={id} className="ml-4 mb-1 list-decimal">
          {renderRichText(data.rich_text)}
          {block.children && (
            <div className="mt-1 pl-4">{renderChildren(block.children)}</div>
          )}
        </li>
      );

    case "to_do": {
      const todoData = data as { rich_text?: RichTextItem[]; checked?: boolean };
      return (
        <div key={id} className="mb-1">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={todoData.checked || false}
              readOnly
              className="mt-1 accent-fg"
            />
            <span className={todoData.checked ? "line-through opacity-60" : ""}>
              {renderRichText(todoData.rich_text)}
            </span>
          </div>
          {block.children && (
            <div className="mt-1 pl-6">{renderChildren(block.children)}</div>
          )}
        </div>
      );
    }

    case "toggle": {
      const toggleData = data as { rich_text?: RichTextItem[] };
      return (
        <details key={id} className="mb-2 border border-border rounded p-3">
          <summary className="cursor-pointer font-medium select-none">
            {renderRichText(toggleData.rich_text)}
          </summary>
          {block.children && block.children.length > 0 && (
            <div className="mt-2 pl-4 border-l border-border">
              {renderChildren(block.children)}
            </div>
          )}
        </details>
      );
    }

    case "code": {
      const codeData = data as { rich_text?: RichTextItem[]; language?: string; caption?: RichTextItem[] };
      const code = codeData.rich_text?.map((t) => t.plain_text).join("") || "";
      return (
        <div key={id} className="mb-4">
          {codeData.language && (
            <div className="text-[10px] uppercase tracking-wide text-muted mb-1">
              {codeData.language}
            </div>
          )}
          <pre className="bg-muted/10 border border-border rounded p-4 overflow-x-auto font-mono text-sm">
            <code>{code}</code>
          </pre>
          {codeData.caption && codeData.caption.length > 0 && (
            <p className="text-xs text-muted mt-1">{renderRichText(codeData.caption)}</p>
          )}
        </div>
      );
    }

    case "quote":
      return (
        <blockquote key={id} className="border-l-2 border-muted pl-4 italic text-muted mb-4">
          {renderRichText(data.rich_text)}
          {block.children && (
            <div className="mt-2 not-italic">{renderChildren(block.children)}</div>
          )}
        </blockquote>
      );

    case "callout": {
      const calloutData = data as {
        rich_text?: RichTextItem[];
        icon?: { type: string; emoji?: string };
      };
      return (
        <div key={id} className="flex items-start gap-3 bg-muted/10 border border-border rounded p-4 mb-4">
          {calloutData.icon?.emoji && <span className="text-lg">{calloutData.icon.emoji}</span>}
          <div className="flex-1">
            {renderRichText(calloutData.rich_text)}
            {block.children && <div className="mt-2">{renderChildren(block.children)}</div>}
          </div>
        </div>
      );
    }

    case "divider":
      return <hr key={id} className="border-border my-8" />;

    case "image": {
      const imageData = data as {
        file?: { url: string };
        external?: { url: string };
        caption?: RichTextItem[];
      };
      const imageUrl = imageData.file?.url || imageData.external?.url;
      if (!imageUrl) return null;
      const altText = imageData.caption?.map((c) => c.plain_text).join("") || "";
      return (
        <figure key={id} className="my-6">
          <NotionImage src={imageUrl} alt={altText} />
          {imageData.caption && imageData.caption.length > 0 && (
            <figcaption className="text-center text-xs text-muted mt-2">
              {renderRichText(imageData.caption)}
            </figcaption>
          )}
        </figure>
      );
    }

    case "video": {
      const videoData = data as { external?: { url: string }; file?: { url: string } };
      const videoUrl = videoData.external?.url || videoData.file?.url;
      if (!videoUrl) return null;
      return (
        <div key={id} className="my-6 aspect-video">
          <iframe
            src={videoUrl}
            className="w-full h-full rounded border border-border"
            loading="lazy"
            allowFullScreen
          />
        </div>
      );
    }

    case "audio": {
      const audioData = data as { file?: { url: string }; external?: { url: string } };
      const audioUrl = audioData.file?.url || audioData.external?.url;
      if (!audioUrl) return null;
      return (
        <audio key={id} controls className="w-full my-4">
          <source src={audioUrl} />
        </audio>
      );
    }

    case "file":
    case "pdf": {
      const fileData = data as { file?: { url: string }; external?: { url: string }; caption?: RichTextItem[] };
      const fileUrl = fileData.file?.url || fileData.external?.url;
      if (!fileUrl) return null;
      return (
        <a
          key={id}
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-border rounded p-3 mb-4 hover:bg-muted/5 transition-colors text-sm"
        >
          {type === "pdf" ? "📄 View PDF" : "📎 Download file"}
        </a>
      );
    }

    case "embed": {
      const embedData = data as { url?: string; caption?: RichTextItem[] };
      if (!embedData.url) return null;
      return (
        <div key={id} className="my-6">
          <iframe
            src={embedData.url}
            className="w-full aspect-video rounded border border-border"
            loading="lazy"
          />
          {embedData.caption && embedData.caption.length > 0 && (
            <p className="text-xs text-muted mt-1 text-center">{renderRichText(embedData.caption)}</p>
          )}
        </div>
      );
    }

    case "bookmark":
    case "link_preview": {
      const bookmarkData = data as { url: string; caption?: RichTextItem[] };
      const caption = bookmarkData.caption || [];
      return (
        <a
          key={id}
          href={bookmarkData.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block border border-border rounded p-3 mb-4 hover:bg-muted/5 transition-colors"
        >
          <p className="text-sm font-medium truncate">{bookmarkData.url}</p>
          {caption.length > 0 && (
            <p className="text-xs text-muted mt-1">{renderRichText(caption)}</p>
          )}
        </a>
      );
    }

    case "equation": {
      const eqData = data as { expression?: string };
      if (!eqData.expression) return null;
      return (
        <div
          key={id}
          className="my-4 p-3 bg-muted/10 border border-border rounded font-mono text-sm overflow-x-auto"
        >
          {eqData.expression}
        </div>
      );
    }

    case "table": {
      const tableData = data as { has_column_header?: boolean; has_row_header?: boolean };
      const rows = block.children || [];
      return (
        <div key={id} className="overflow-x-auto mb-4">
          <table className="w-full text-sm border-collapse border border-border">
            <tbody>
              {rows.map((row, rowIndex) => {
                const rowData = row.table_row as { cells: RichTextItem[][] };
                if (!rowData?.cells) return null;
                const isHeaderRow = tableData.has_column_header && rowIndex === 0;
                return (
                  <tr key={row.id} className="border-b border-border">
                    {rowData.cells.map((cell, cellIndex) => {
                      const isHeaderCol = tableData.has_row_header && cellIndex === 0;
                      const CellTag = isHeaderRow || isHeaderCol ? "th" : "td";
                      return (
                        <CellTag
                          key={cellIndex}
                          className="border border-border px-3 py-2 text-left align-top font-normal"
                        >
                          {renderRichText(cell)}
                        </CellTag>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case "column_list": {
      const columns = block.children || [];
      return (
        <div key={id} className="flex flex-col sm:flex-row gap-6 mb-4">
          {columns.map((col) => (
            <div key={col.id} className="flex-1 min-w-0">
              {renderChildren(col.children)}
            </div>
          ))}
        </div>
      );
    }

    case "synced_block":
      return block.children ? (
        <Fragment key={id}>{renderChildren(block.children)}</Fragment>
      ) : null;

    case "child_page": {
      const pageData = data as { title?: string };
      return (
        <div key={id} className="border border-border rounded p-3 mb-4 text-sm">
          📄 {pageData.title || "Untitled page"}
        </div>
      );
    }

    // Structural / navigational blocks with no useful standalone rendering
    case "column":
    case "table_of_contents":
    case "breadcrumb":
    case "template":
    case "child_database":
    case "link_to_page":
      return null;

    default:
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[NotionRenderer] Unsupported block type: "${type}"`);
      }
      return null;
  }
}

/** Wraps every block render in a try/catch so one malformed block can't take down the page. */
function renderBlock(block: Block): React.ReactNode {
  try {
    return renderBlockInner(block);
  } catch (err) {
    console.error(`[NotionRenderer] Failed to render block ${block.id} (${block.type}):`, err);
    return (
      <div
        key={block.id}
        className="text-xs text-red-500/70 border border-red-500/20 rounded p-2 mb-2"
      >
        Couldn't render this block ({block.type})
      </div>
    );
  }
}

function groupListItems(blocks: Block[]): React.ReactNode[] {
  const result: React.ReactNode[] = [];
  let bulletList: React.ReactNode[] = [];
  let numberedList: React.ReactNode[] = [];

  const flushBulletList = () => {
    if (bulletList.length > 0) {
      result.push(
        <ul key={`ul-${result.length}`} className="mb-4 list-disc">
          {bulletList}
        </ul>
      );
      bulletList = [];
    }
  };

  const flushNumberedList = () => {
    if (numberedList.length > 0) {
      result.push(
        <ol key={`ol-${result.length}`} className="mb-4">
          {numberedList}
        </ol>
      );
      numberedList = [];
    }
  };

  for (const block of blocks) {
    if (!block || !block.type) continue;

    if (block.type === "bulleted_list_item") {
      flushNumberedList();
      bulletList.push(renderBlock(block));
    } else if (block.type === "numbered_list_item") {
      flushBulletList();
      numberedList.push(renderBlock(block));
    } else {
      flushBulletList();
      flushNumberedList();
      const rendered = renderBlock(block);
      if (rendered) result.push(rendered);
    }
  }

  flushBulletList();
  flushNumberedList();

  return result;
}

interface NotionRendererProps {
  blocks: Block[];
}

export function NotionRenderer({ blocks }: NotionRendererProps) {
  if (!blocks || blocks.length === 0) {
    return <p className="text-sm text-muted">This post has no content yet.</p>;
  }

  try {
    return <>{groupListItems(blocks)}</>;
  } catch (err) {
    console.error("[NotionRenderer] Fatal render error:", err);
    return (
      <p className="text-sm text-red-500">
        Something went wrong rendering this post's content.
      </p>
    );
  }
}