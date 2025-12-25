'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type RandomMessage = {
  id: string;
  content: string;
  createdAt: string;
};

type NotificationItem = {
  id: string;
  messageId: string;
  content: string;
  createdAt: string;
};

type ToastItem = {
  id: string;
  text: string;
};

function getCookie(name: string) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : '';
}

function setCookie(name: string, value: string, days = 3650) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax`;
}

function getOrCreateClientId() {
  const key = 'mp_client_id';
  const existingLocal = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  const existingCookie = typeof document !== 'undefined' ? getCookie(key) : '';
  const existing = existingLocal || existingCookie;

  if (existing) {
    if (!existingCookie) setCookie(key, existing);
    if (!existingLocal) localStorage.setItem(key, existing);
    return existing;
  }

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : String(Date.now()) + '-' + Math.random().toString(16).slice(2);

  localStorage.setItem(key, id);
  setCookie(key, id);
  return id;
}

export default function Page() {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [loadingRandom, setLoadingRandom] = useState(false);
  const [randomMsg, setRandomMsg] = useState<RandomMessage | null>(null);

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimers = useRef<Map<string, any>>(new Map());

  const canSubmit = useMemo(() => content.trim().length > 0 && content.trim().length <= 2000, [content]);

  function pushToast(text: string) {
    const id = String(Date.now()) + '-' + Math.random().toString(16).slice(2);
    setToasts((prev) => [...prev, { id, text }]);

    const t = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
      toastTimers.current.delete(id);
    }, 5000);

    toastTimers.current.set(id, t);
  }

  useEffect(() => {
    getOrCreateClientId();
    return () => {
      toastTimers.current.forEach((t) => clearTimeout(t));
      toastTimers.current.clear();
    };
  }, []);

  useEffect(() => {
    let alive = true;

    async function poll() {
      try {
        const res = await fetch('/api/notifications', { method: 'GET', cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const list: NotificationItem[] = Array.isArray(data?.notifications) ? data.notifications : [];
        if (!alive) return;

        for (const n of list) {
          const preview = n.content.length > 80 ? n.content.slice(0, 80) + '…' : n.content;
          pushToast(`Your message was drawn: “${preview}”`);
        }
      } catch {}
    }

    poll();
    const id = setInterval(poll, 2000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  async function submit() {
    if (!canSubmit || submitting) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Submit failed.');

      setContent('');
      pushToast('Submitted to the pool ✅');
    } catch (e: any) {
      pushToast(e?.message || 'Submit failed.');
    } finally {
      setSubmitting(false);
    }
  }

  async function pickRandom() {
    if (loadingRandom) return;
    setLoadingRandom(true);

    try {
      const res = await fetch('/api/random', { method: 'GET', cache: 'no-store' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Draw failed.');

      setRandomMsg(data.message);
    } catch (e: any) {
      setRandomMsg(null);
      pushToast(e?.message || 'Draw failed.');
    } finally {
      setLoadingRandom(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #eaf5ff 0%, #f7fbff 55%, #ffffff 100%)',
        padding: 24,
        fontFamily: 'ui-sans-serif, system-ui',
      }}
    >
      <div
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          display: 'grid',
          gap: 10,
          zIndex: 50,
          width: 360,
          maxWidth: 'calc(100vw - 32px)',
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              padding: 12,
              borderRadius: 12,
              border: '1px solid rgba(30, 64, 175, 0.18)',
              background: 'rgba(239, 246, 255, 0.95)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              color: '#0f172a',
              fontSize: 14,
              lineHeight: 1.35,
            }}
          >
            {t.text}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 30, fontWeight: 850, marginBottom: 6, color: '#0b2a4a' }}>Message Pool</h1>
        <p style={{ marginTop: 0, opacity: 0.8, marginBottom: 18, color: '#0b2a4a' }}>
          Anyone can submit a message. Anyone can draw one at random.
        </p>

        <section
          style={{
            display: 'grid',
            gap: 12,
            padding: 16,
            border: '1px solid rgba(30, 64, 175, 0.18)',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ fontWeight: 750, color: '#0b2a4a' }}>Submit a message</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type anything (max 2000 characters)"
            rows={5}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 12,
              border: '1px solid rgba(30, 64, 175, 0.25)',
              resize: 'vertical',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              onClick={submit}
              disabled={!canSubmit || submitting}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid rgba(30, 64, 175, 0.35)',
                background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                cursor: !canSubmit || submitting ? 'not-allowed' : 'pointer',
                opacity: !canSubmit || submitting ? 0.6 : 1,
                fontWeight: 750,
              }}
            >
              {submitting ? 'Submitting…' : 'Submit'}
            </button>

            <span style={{ fontSize: 12, opacity: 0.75, color: '#0b2a4a' }}>{content.trim().length}/2000</span>
          </div>
        </section>

        <div style={{ height: 18 }} />

        <section
          style={{
            display: 'grid',
            gap: 12,
            padding: 16,
            border: '1px solid rgba(30, 64, 175, 0.18)',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 750, color: '#0b2a4a' }}>Draw a random message</div>
            <button
              onClick={pickRandom}
              disabled={loadingRandom}
              style={{
                padding: '10px 14px',
                borderRadius: 12,
                border: '1px solid rgba(30, 64, 175, 0.25)',
                background: 'white',
                cursor: loadingRandom ? 'not-allowed' : 'pointer',
                opacity: loadingRandom ? 0.6 : 1,
                fontWeight: 750,
                color: '#0b2a4a',
              }}
            >
              {loadingRandom ? 'Drawing…' : 'Draw'}
            </button>
          </div>

          {randomMsg ? (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: '1px solid rgba(30, 64, 175, 0.18)',
                background: 'rgba(239, 246, 255, 0.65)',
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8, color: '#0b2a4a' }}>
                #{randomMsg.id} · {new Date(randomMsg.createdAt).toLocaleString()}
              </div>
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 14, color: '#0b2a4a' }}>
                {randomMsg.content}
              </pre>
            </div>
          ) : (
            <div
              style={{
                padding: 14,
                borderRadius: 12,
                border: '1px dashed rgba(30, 64, 175, 0.25)',
                opacity: 0.8,
                color: '#0b2a4a',
              }}
            >
              No message drawn yet.
            </div>
          )}
        </section>

        <footer style={{ marginTop: 22, fontSize: 12, opacity: 0.72, color: '#0b2a4a' }}>
          Tip: For a public site, consider adding rate limiting and abuse prevention.
        </footer>
      </div>
    </main>
  );
}
