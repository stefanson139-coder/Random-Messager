'use client';

import { useMemo, useState } from 'react';

type RandomMessage = {
  id: string;
  content: string;
  createdAt: string;
};

export default function Page() {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loadingRandom, setLoadingRandom] = useState(false);
  const [randomMsg, setRandomMsg] = useState<RandomMessage | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const canSubmit = useMemo(
    () => content.trim().length > 0 && content.trim().length <= 2000,
    [content]
  );

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setToast(null);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '提交失敗');

      setContent('');
      setToast('已投入訊息池 ✅');
    } catch (e: any) {
      setToast(e?.message || '提交失敗');
    } finally {
      setSubmitting(false);
    }
  }

  async function pickRandom() {
    if (loadingRandom) return;
    setLoadingRandom(true);
    setToast(null);

    try {
      const res = await fetch('/api/random', { method: 'GET' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || '抽取失敗');

      setRandomMsg(data.message);
    } catch (e: any) {
      setRandomMsg(null);
      setToast(e?.message || '抽取失敗');
    } finally {
      setLoadingRandom(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>訊息池</h1>
      <p style={{ marginTop: 0, opacity: 0.75, marginBottom: 18 }}>
        任何人都可以投入訊息；也可以隨機抽一則看看。
      </p>

      <section style={{ display: 'grid', gap: 12, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <div style={{ fontWeight: 700 }}>投入一則訊息</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="輸入任何訊息（最多 2000 字）"
          rows={5}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 10,
            border: '1px solid #d1d5db',
            resize: 'vertical',
            fontSize: 14,
          }}
        />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={submit}
            disabled={!canSubmit || submitting}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #111827',
              background: '#111827',
              color: 'white',
              cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
              opacity: !canSubmit || submitting ? 0.6 : 1,
              fontWeight: 700,
            }}
          >
            {submitting ? '提交中…' : '投入訊息池'}
          </button>

          <span style={{ fontSize: 12, opacity: 0.7 }}>
            {content.trim().length}/2000
          </span>
        </div>
      </section>

      <div style={{ height: 18 }} />

      <section style={{ display: 'grid', gap: 12, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <div style={{ fontWeight: 700 }}>隨機觀看一則</div>
          <button
            onClick={pickRandom}
            disabled={loadingRandom}
            style={{
              padding: '10px 14px',
              borderRadius: 10,
              border: '1px solid #d1d5db',
              background: 'white',
              cursor: loadingRandom ? 'not-allowed' : 'pointer',
              opacity: loadingRandom ? 0.6 : 1,
              fontWeight: 700,
            }}
          >
            {loadingRandom ? '抽取中…' : '抽一則'}
          </button>
        </div>

        {randomMsg ? (
          <div style={{ padding: 14, borderRadius: 10, border: '1px solid #d1d5db', background: '#fafafa' }}>
            <div style={{ fontSize: 12, opacity: 0.65, marginBottom: 8 }}>
              #{randomMsg.id} · {new Date(randomMsg.createdAt).toLocaleString()}
            </div>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14 }}>
              {randomMsg.content}
            </pre>
          </div>
        ) : (
          <div style={{ padding: 14, borderRadius: 10, border: '1px dashed #d1d5db', opacity: 0.75 }}>
            尚未抽取任何訊息
          </div>
        )}
      </section>

      {toast && (
        <div style={{ marginTop: 16, padding: 12, borderRadius: 10, border: '1px solid #d1d5db' }}>
          {toast}
        </div>
      )}

      <footer style={{ marginTop: 22, fontSize: 12, opacity: 0.65 }}>
        若你打算公開給所有人使用，建議加入防濫用（rate limit）、敏感內容過濾與回報機制。
      </footer>
    </main>
  );
}
