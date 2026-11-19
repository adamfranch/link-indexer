
"use client";

import { useEffect, useMemo, useState } from "react";

const HISTORY_KEY = "linkindexer_history_v1";

export default function Home() {
  const [urls, setUrls] = useState("");
  const [history, setHistory] = useState([]);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const parsedUrls = useMemo(() => {
    return [...new Set(
      urls.split(/\r?\n/).map(x => x.trim()).filter(Boolean)
    )];
  }, [urls]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      setHistory([]);
    }
  }, []);

  function saveHistory(items) {
    setHistory(items);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
  }

  async function checkAccount() {
    setAccountLoading(true);
    setError("");

    try {
      const response = await fetch("/api/account", {
        cache: "no-store"
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Account check failed");
      }

      setAccount(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setAccountLoading(false);
    }
  }

  async function submitUrls() {
    if (!parsedUrls.length) {
      setError("Please enter at least one URL.");
      return;
    }

    if (parsedUrls.length > 10000) {
      setError("Maximum 10,000 URLs per submission.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    setResult(null);

    const batches = [];

    for (let i = 0; i < parsedUrls.length; i += 100) {
      batches.push(parsedUrls.slice(i, i + 100));
    }

    let completed = 0;
    let failed = 0;
    const records = [];

    try {
      for (const batch of batches) {
        const response = await fetch("/api/index", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ urls: batch })
        });

        const data = await response.json();

        records.push({
          id: Date.now() + completed,
          date: new Date().toISOString(),
          urls: batch,
          success: response.ok,
          response: data
        });

        if (response.ok) {
          completed += batch.length;
        } else {
          failed += batch.length;
          throw new Error(
            data.error || "Indexing API returned an error"
          );
        }
      }

      setResult({ completed, failed });
      setMessage(`${completed} URLs submitted successfully.`);
      setUrls("");
      await checkAccount();

    } catch (e) {
      setError(e.message);
      setResult({ completed, failed });
    } finally {
      saveHistory([...records.reverse(), ...history].slice(0, 100));
      setLoading(false);
    }
  }

  async function copyUrls() {
    await navigator.clipboard.writeText(parsedUrls.join("\n"));
    setMessage("URLs copied to clipboard.");
  }

  function clearHistory() {
    if (confirm("Delete all local submission history?")) {
      saveHistory([]);
    }
  }

  const accountValues = account && typeof account === "object"
    ? Object.entries(account).filter(
        ([key, value]) =>
          !/api.?key|token|secret|password/i.test(key) &&
          ["string", "number", "boolean"].includes(typeof value)
      )
    : [];

  return (
    <main className="container">
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-icon">↗</span>
          <span>LinkIndexer</span>
        </a>
        <span className="private-label">Personal dashboard</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">URL MANAGEMENT</p>
        <h1>URL Indexing Dashboard</h1>
        <p className="muted">
          Submit URLs in bulk and manage your indexing activity.
        </p>
      </section>

      <section className="stats">
        <div className="stat-card">
          <span>URLs in current list</span>
          <strong>{parsedUrls.length.toLocaleString()}</strong>
        </div>
        <div className="stat-card">
          <span>Saved batches</span>
          <strong>{history.length}</strong>
        </div>
        <div className="stat-card">
          <span>Successful URLs in history</span>
          <strong>
            {history.filter(x => x.success)
              .reduce((sum, x) => sum + x.urls.length, 0)}
          </strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Submit URLs</h2>
            <p className="muted">
              Paste one URL per line. Duplicate URLs are removed.
            </p>
          </div>
          <span className="count">{parsedUrls.length} URLs</span>
        </div>

        <textarea
          value={urls}
          onChange={e => setUrls(e.target.value)}
          placeholder={"https://example.com/page-1\nhttps://example.com/page-2\nhttps://example.com/page-3"}
          spellCheck="false"
        />

        <div className="form-footer">
          <span className="muted">Maximum 100 URLs per API request</span>
          <div className="actions">
            <button className="button secondary"
              onClick={() => setUrls("")}>
              Clear
            </button>
            <button className="button secondary"
              onClick={copyUrls} disabled={!parsedUrls.length}>
              Copy URLs
            </button>
            <button className="button primary"
              onClick={submitUrls}
              disabled={loading || !parsedUrls.length}>
              {loading ? "Submitting..." : "Submit for indexing →"}
            </button>
          </div>
        </div>

        {loading && <p className="notice">Processing URL batches...</p>}
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        {result && (
          <div className="result">
            <strong>Submission summary</strong>
            <p>Successful URLs: {result.completed}</p>
            <p>Failed URLs: {result.failed}</p>
          </div>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>API Account</h2>
            <p className="muted">
              Check your IndexMyLink account information.
            </p>
          </div>
          <button className="button secondary"
            onClick={checkAccount} disabled={accountLoading}>
            {accountLoading ? "Checking..." : "Refresh account"}
          </button>
        </div>

        {account ? (
          <div className="account-grid">
            {accountValues.map(([key, value]) => (
              <div className="account-item" key={key}>
                <span>{key.replace(/_/g, " ")}</span>
                <strong>{String(value)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="muted">
            Click Refresh account to load your live API details.
          </p>
        )}
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Submission History</h2>
            <p className="muted">
              Stored locally in this browser only.
            </p>
          </div>
          <button className="button danger"
            onClick={clearHistory} disabled={!history.length}>
            Clear history
          </button>
        </div>

        {!history.length ? (
          <div className="empty">
            <span>◷</span>
            <p>No submissions yet.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map(item => (
              <div className="history-item" key={item.id}>
                <div className="history-info">
                  <strong>{item.urls.length} URLs</strong>
                  <span>
                    {new Date(item.date).toLocaleString()}
                  </span>
                </div>
                <span className={item.success ? "status-ok" : "status-fail"}>
                  {item.success ? "Submitted" : "Failed"}
                </span>
                <button className="text-button"
                  onClick={() =>
                    navigator.clipboard.writeText(item.urls.join("\n"))
                  }>
                  Copy
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <footer>
        LinkIndexer · Personal URL Indexing Tool
      </footer>
    </main>
  );
}
