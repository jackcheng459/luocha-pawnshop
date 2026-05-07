import { forwardRef } from "react";
import type { FateStoryRecord } from "../../data/types";
import { sanitizeShareText } from "../../game/compliance";
import { StoryQr } from "../StoryQr";

type FateStoryCardProps = {
  story: FateStoryRecord;
  storyUrl?: string;
};

export const FateStoryCard = forwardRef<HTMLDivElement, FateStoryCardProps>(function FateStoryCard(
  { story, storyUrl },
  ref
) {
  const body = sanitizeShareText(story.storyText, "这一夜的故事已入账。");
  const [mainBody, closing] = splitClosing(body);
  const absoluteUrl = storyUrl ?? `/story/${story.storyId}`;

  return (
    <div className="story-share-card" ref={ref}>
      <div className="story-card-brand">罗刹当铺 · 一夜笔记</div>
      <div className="story-card-stamp">{sanitizeShareText(story.fateName, "无名命牌")}</div>
      <p className="story-card-judgment">
        {sanitizeShareText(story.fateJudgment, "此命无批，账上有风。")}
      </p>
      <div className="story-card-divider" />
      <article className="story-card-body">
        {mainBody.split(/\n+/).map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </article>
      {closing ? <p className="story-card-closing">{closing}</p> : null}
      <footer className="story-card-footer">
        <span>luochapawnshop.top</span>
        <StoryQr caption="扫读一夜笔记" url={absoluteUrl} />
      </footer>
    </div>
  );
});

function splitClosing(text: string): [string, string?] {
  const parts = text.split(/\n+/).map((part) => part.trim()).filter(Boolean);
  const closingIndex = parts.findIndex((part) => part.includes("夜账末页"));
  if (closingIndex < 0) return [parts.join("\n")];
  const main = parts.slice(0, closingIndex).join("\n");
  const closing = parts.slice(closingIndex).join("\n");
  return [main || parts.join("\n"), closing];
}
