import { useEffect, useMemo, useState } from "react";
import { phraseTypeLabels } from "../data/goldenPhrases";
import type { Phrase, PhraseStatus, PhraseType } from "../data/types";

const phraseTypes = Object.keys(phraseTypeLabels) as PhraseType[];

export function PhraseAdmin() {
  const [token, setToken] = useState(() => window.sessionStorage.getItem("luocha:admin-token") ?? "");
  const [type, setType] = useState<PhraseType>("recognize_pain");
  const [count, setCount] = useState(5);
  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [status, setStatus] = useState<PhraseStatus | "all">("pending_review");
  const [message, setMessage] = useState("输入 ADMIN_TOKEN 后读取金句库。");
  const grouped = useMemo(() => groupPhrases(phrases), [phrases]);

  useEffect(() => {
    if (!token) return;
    window.sessionStorage.setItem("luocha:admin-token", token);
    void loadPhrases();
  }, [token, status]);

  async function loadPhrases() {
    setMessage("正在翻金句账。");
    const response = await fetch(`/api/phrase/list?status=${status}`, {
      headers: adminHeaders(token)
    });
    if (!response.ok) {
      setMessage("后台口令不对，或 Vercel 尚未配置 ADMIN_TOKEN。");
      return;
    }
    const data = (await response.json()) as { phrases?: Phrase[] };
    setPhrases(data.phrases ?? []);
    setMessage(`已载入 ${data.phrases?.length ?? 0} 句。`);
  }

  async function generateBatch() {
    setMessage("正在请掌柜写新句。");
    const response = await fetch("/api/phrase/generate", {
      method: "POST",
      headers: {
        ...adminHeaders(token),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ type, count })
    });
    if (!response.ok) {
      setMessage("生成失败。检查 ADMIN_TOKEN 与 LLM 环境变量。");
      return;
    }
    await loadPhrases();
  }

  async function reviewPhrase(id: string, nextStatus: PhraseStatus) {
    const response = await fetch(`/api/phrase/${id}`, {
      method: "PATCH",
      headers: {
        ...adminHeaders(token),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: nextStatus })
    });
    if (!response.ok) {
      setMessage("审核失败。");
      return;
    }
    await loadPhrases();
  }

  function exportJson() {
    window.location.href = `/api/admin/phrases/export?token=${encodeURIComponent(token)}`;
  }

  return (
    <main className="admin-page">
      <section className="admin-panel">
        <header>
          <p>罗刹当铺</p>
          <h1>临别金句库管理</h1>
        </header>
        <div className="admin-toolbar">
          <input
            aria-label="ADMIN_TOKEN"
            placeholder="ADMIN_TOKEN"
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <select value={status} onChange={(event) => setStatus(event.target.value as PhraseStatus | "all")}>
            <option value="pending_review">待审核</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
            <option value="all">全部</option>
          </select>
          <button className="ghost-button" type="button" onClick={exportJson}>
            导出 JSON
          </button>
        </div>
        <div className="admin-toolbar">
          <select value={type} onChange={(event) => setType(event.target.value as PhraseType)}>
            {phraseTypes.map((phraseType) => (
              <option key={phraseType} value={phraseType}>
                {phraseTypeLabels[phraseType]}
              </option>
            ))}
          </select>
          <input
            aria-label="生成数量"
            max={10}
            min={1}
            type="number"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
          <button className="seal-button" type="button" onClick={generateBatch}>
            生成新批次
          </button>
        </div>
        <p className="admin-message">{message}</p>
        {Object.entries(grouped).map(([groupType, entries]) => (
          <section className="phrase-group" key={groupType}>
            <h2>{phraseTypeLabels[groupType as PhraseType] ?? groupType}</h2>
            {entries.map((phrase) => (
              <article className="phrase-row" key={phrase.id}>
                <p>{phrase.text}</p>
                <small>
                  {phrase.status} · 用过 {phrase.usedCount} 次
                </small>
                <div>
                  <button className="ghost-button" type="button" onClick={() => reviewPhrase(phrase.id, "approved")}>
                    通过
                  </button>
                  <button className="ghost-button" type="button" onClick={() => reviewPhrase(phrase.id, "rejected")}>
                    拒绝
                  </button>
                </div>
              </article>
            ))}
          </section>
        ))}
      </section>
    </main>
  );
}

function adminHeaders(token: string): Record<string, string> {
  return { "x-admin-token": token };
}

function groupPhrases(phrases: Phrase[]): Partial<Record<PhraseType, Phrase[]>> {
  return phrases.reduce<Partial<Record<PhraseType, Phrase[]>>>((groups, phrase) => {
    groups[phrase.type] = [...(groups[phrase.type] ?? []), phrase];
    return groups;
  }, {});
}
