"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main><div className="empty"><h2>Something wandered off.</h2><p>We couldn&apos;t load this page.</p><button onClick={reset}>Try again</button></div></main>;
}
