import { useEffect, useState } from "react";
import type { FateStoryRecord } from "../data/types";
import { fetchFateStory } from "../services/storyClient";
import { StoryCardExportButton } from "./export/StoryCardExportButton";

type StoryPageProps = {
  storyId: string;
};

export function StoryPage({ storyId }: StoryPageProps) {
  const [story, setStory] = useState<FateStoryRecord | null>();

  useEffect(() => {
    let active = true;
    fetchFateStory(storyId, window.location.search).then((record) => {
      if (active) setStory(record);
    });
    return () => {
      active = false;
    };
  }, [storyId]);

  useEffect(() => {
    if (!story) return;
    document.title = `${story.fateName} · 罗刹当铺一夜笔记`;
    setMeta("description", story.fateJudgment);
    setOg("og:title", `${story.fateName} · 一夜笔记`);
    setOg("og:description", story.fateJudgment);
    setOg("og:type", "article");
    setOg("og:image", `${window.location.origin}/images/luocha-pawnshop-poster-4x3.jpg`);
  }, [story]);

  if (story === undefined) {
    return (
      <main className="story-page">
        <section className="story-paper">
          <p className="story-page-brand">罗刹当铺 · 一夜笔记</p>
          <p className="story-loading">掌柜正在翻旧账。</p>
        </section>
      </main>
    );
  }

  if (!story) {
    return (
      <main className="story-page">
        <section className="story-paper">
          <p className="story-page-brand">罗刹当铺 · 一夜笔记</p>
          <h1>此票已入雾</h1>
          <p className="story-missing">这张命牌的故事未能寻回。若是在本机刚生成，可回到游戏重新打开。</p>
          <a className="seal-button" href="/">
            我也走一遭
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="story-page">
      <section className="story-paper">
        <header className="story-page-header">
          <p className="story-page-brand">罗刹当铺 · 一夜笔记</p>
          <span>{story.timestamp} · {story.seasonTerm ?? "无记"}</span>
        </header>
        <div className="story-fate-stamp">{story.fateName}</div>
        <p className="story-judgment">{story.fateJudgment}</p>
        {story.fateDetail ? <p className="story-detail">{story.fateDetail}</p> : null}
        <article className="night-story">
          {story.storyText.split(/\n+/).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
        <footer className="story-page-footer">
          <small>故事属于这一夜，不属于任何账号。</small>
          <div className="story-page-actions">
            <StoryCardExportButton
              label="保存这个故事"
              story={story}
              storyUrl={`${window.location.origin}/story/${story.storyId}`}
            />
            <a className="seal-button" href="/">
              我也走一遭
            </a>
          </div>
        </footer>
      </section>
    </main>
  );
}

function setMeta(name: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;
}

function setOg(property: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute("property", property);
    document.head.appendChild(element);
  }
  element.content = content;
}
