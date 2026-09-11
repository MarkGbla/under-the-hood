import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="not-found page-surface">
      <div>
        <span>404 · Route not found</span>
        <h1>This request has nowhere to go.</h1>
        <p>The server understood the request, but this route is not part of the application.</p>
        <Link className="button button-primary" href="/explore">Explore existing routes <span aria-hidden="true">→</span></Link>
      </div>
    </div>
  );
}
