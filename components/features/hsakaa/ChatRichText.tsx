import type { ReactNode } from "react";

interface ChatRichTextProps {
  content: string;
}

type Block =
  | { type: "paragraph"; lines: string[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; lines: string[] }
  | { type: "code"; language?: string; value: string }
  | { type: "heading"; level: number; value: string }
  | { type: "rule" };

function safeHref(value: string): string | null {
  const href = value.trim();

  if (/^(https?:\/\/|mailto:)/i.test(href)) {
    return href;
  }

  return null;
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let tokenIndex = 0;

  // A local RegExp per recursion prevents nested formatting from resetting
  // the parent parser state.
  const inlineMarkdownPattern =
    /(\*\*\*[^*\n]+\*\*\*|___[^_\n]+___|\*\*[^*\n]+\*\*|__[^_\n]+__|~~[^~\n]+~~|`[^`\n]+`|\[[^\]\n]+\]\([^)\n]+\)|\*[^*\n]+\*|_[^_\n]+_)/g;

  while ((match = inlineMarkdownPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    const key = `${keyPrefix}-${tokenIndex}`;

    if (
      (token.startsWith("***") && token.endsWith("***")) ||
      (token.startsWith("___") && token.endsWith("___"))
    ) {
      nodes.push(
        <strong key={key} className="font-bold text-white">
          <em>{token.slice(3, -3)}</em>
        </strong>,
      );
    } else if (
      (token.startsWith("**") && token.endsWith("**")) ||
      (token.startsWith("__") && token.endsWith("__"))
    ) {
      nodes.push(
        <strong key={key} className="font-bold text-white">
          {renderInline(token.slice(2, -2), `${key}-strong`)}
        </strong>,
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      nodes.push(
        <del key={key} className="text-white/48">
          {renderInline(token.slice(2, -2), `${key}-del`)}
        </del>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded-md bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.92em] text-white/86"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[")) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const label = linkMatch?.[1] ?? token;
      const href = linkMatch ? safeHref(linkMatch[2]) : null;

      if (href) {
        nodes.push(
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium text-[#C6FF32] underline decoration-[#C6FF32]/35 underline-offset-4 transition hover:decoration-[#C6FF32]"
          >
            {renderInline(label, `${key}-link`)}
          </a>,
        );
      } else {
        nodes.push(label);
      }
    } else if (
      (token.startsWith("*") && token.endsWith("*")) ||
      (token.startsWith("_") && token.endsWith("_"))
    ) {
      nodes.push(
        <em key={key} className="italic text-white/82">
          {renderInline(token.slice(1, -1), `${key}-em`)}
        </em>,
      );
    } else {
      nodes.push(token);
    }

    lastIndex = match.index + token.length;
    tokenIndex += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const fence = line.match(/^```([^`]*)$/);

    if (fence) {
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code",
        language: fence[1]?.trim() || undefined,
        value: codeLines.join("\n"),
      });
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);

    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length,
        value: heading[2],
      });
      index += 1;
      continue;
    }

    if (/^\s*(?:---|___|\*\*\*)\s*$/.test(line)) {
      blocks.push({ type: "rule" });
      index += 1;
      continue;
    }

    if (/^\s*[-+*]\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\s*[-+*]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*[-+*]\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];

      while (index < lines.length && /^\s*\d+[.)]\s+/.test(lines[index])) {
        items.push(lines[index].replace(/^\s*\d+[.)]\s+/, ""));
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && /^\s*>\s?/.test(lines[index])) {
        quoteLines.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }

      blocks.push({ type: "blockquote", lines: quoteLines });
      continue;
    }

    const paragraphLines: string[] = [line];
    index += 1;

    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^```/.test(lines[index]) &&
      !/^(#{1,4})\s+/.test(lines[index]) &&
      !/^\s*[-+*]\s+/.test(lines[index]) &&
      !/^\s*\d+[.)]\s+/.test(lines[index]) &&
      !/^\s*>\s?/.test(lines[index]) &&
      !/^\s*(?:---|___|\*\*\*)\s*$/.test(lines[index])
    ) {
      paragraphLines.push(lines[index]);
      index += 1;
    }

    blocks.push({ type: "paragraph", lines: paragraphLines });
  }

  return blocks;
}

function renderLines(lines: string[], keyPrefix: string) {
  return lines.map((line, index) => (
    <span key={`${keyPrefix}-${index}`}>
      {renderInline(line, `${keyPrefix}-${index}`)}
      {index < lines.length - 1 ? <br /> : null}
    </span>
  ));
}

export function ChatRichText({ content }: ChatRichTextProps) {
  const blocks = parseBlocks(content);

  return (
    <div className="space-y-3 text-[13px] font-normal leading-[1.75] text-white/72 [overflow-wrap:anywhere]">
      {blocks.map((block, index) => {
        const key = `chat-rich-text-${index}`;

        switch (block.type) {
          case "heading": {
            const className =
              block.level === 1
                ? "text-[15px] font-semibold text-white/94"
                : "text-[13px] font-semibold text-white/90";

            return (
              <div key={key} className={className}>
                {renderInline(block.value, `${key}-heading`)}
              </div>
            );
          }
          case "unordered-list":
            return (
              <ul key={key} className="list-disc space-y-1 pl-5 marker:text-white/28">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>
                    {renderInline(item, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </ul>
            );
          case "ordered-list":
            return (
              <ol key={key} className="list-decimal space-y-1 pl-5 marker:text-white/34">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>
                    {renderInline(item, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </ol>
            );
          case "blockquote":
            return (
              <blockquote
                key={key}
                className="border-l-2 border-[#C6FF32]/35 pl-3 italic text-white/58"
              >
                {renderLines(block.lines, `${key}-quote`)}
              </blockquote>
            );
          case "code":
            return (
              <pre
                key={key}
                className="max-w-full overflow-x-auto rounded-xl border border-white/[0.07] bg-black/25 px-3.5 py-3 text-[12px] leading-6 text-white/78"
              >
                <code className="font-mono">{block.value}</code>
              </pre>
            );
          case "rule":
            return <hr key={key} className="border-white/[0.08]" />;
          case "paragraph":
            return (
              <p key={key} className="m-0">
                {renderLines(block.lines, `${key}-paragraph`)}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
