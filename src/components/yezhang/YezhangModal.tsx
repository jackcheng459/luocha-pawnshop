import { BookOpen, Trash2, X } from "lucide-react";
import type { YezhangRecord } from "../../services/yezhang";

type YezhangModalProps = {
  records: YezhangRecord[];
  confirmingClear: boolean;
  onClose: () => void;
  onAskClear: () => void;
  onCancelClear: () => void;
  onConfirmClear: () => void;
};

export function YezhangModal({
  records,
  confirmingClear,
  onAskClear,
  onCancelClear,
  onClose,
  onConfirmClear
}: YezhangModalProps) {
  return (
    <div className="yezhang-backdrop" role="dialog" aria-modal="true" aria-label="夜账">
      <section className="yezhang-modal">
        <button className="yezhang-close" type="button" onClick={onClose} aria-label="关闭夜账">
          <X size={18} strokeWidth={1.8} />
        </button>
        <p className="story-page-brand">掌柜抬眼</p>
        <h2>夜账</h2>
        {confirmingClear ? (
          <div className="yezhang-confirm">
            <p>客官果真要忘了这几夜？</p>
            <small>此举不可还原。</small>
            <div className="action-row center">
              <button className="seal-button" type="button" onClick={onConfirmClear}>
                是，清空
              </button>
              <button className="ghost-button" type="button" onClick={onCancelClear}>
                不，留着
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="yezhang-intro">夜账上记得，客官曾来过几夜。</p>
            <div className="yezhang-list">
              {records.map((record) => (
                <article className="yezhang-record" key={record.storyId}>
                  <small>{record.timestamp}</small>
                  <strong>{record.fateName}</strong>
                  <p>{record.judgmentSnippet}</p>
                  <a className="ghost-button" href={`/story/${record.storyId}`}>
                    <BookOpen size={15} strokeWidth={1.8} />
                    <span>翻看那一夜</span>
                  </a>
                </article>
              ))}
            </div>
            <footer className="yezhang-footer">
              <small>共 {records.length} 夜，最多记得 20 夜。</small>
              <button className="ghost-button yezhang-clear" type="button" onClick={onAskClear}>
                <Trash2 size={15} strokeWidth={1.8} />
                <span>清空夜账</span>
              </button>
            </footer>
          </>
        )}
      </section>
    </div>
  );
}
