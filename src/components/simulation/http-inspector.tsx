type Header = {
  name: string;
  value: string;
};

type HttpInspectorProps = {
  kind: "request" | "response";
  headline: string;
  headers: ReadonlyArray<Header>;
  body?: string;
};

export function HttpInspector({ kind, headline, headers, body }: HttpInspectorProps) {
  return (
    <section className={`http-inspector inspector-${kind}`} aria-label={`HTTP ${kind} inspector`}>
      <div className="inspector-heading">
        <span>HTTP {kind}</span>
        <i>{kind === "request" ? "Outbound" : "Inbound"}</i>
      </div>
      <code className="inspector-headline">{headline}</code>
      <div className="inspector-section">
        <strong>Headers</strong>
        <dl>
          {headers.map((header) => (
            <div key={header.name}>
              <dt>{header.name}</dt>
              <dd>{header.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="inspector-section">
        <strong>Body</strong>
        <pre>{body ?? "None"}</pre>
      </div>
    </section>
  );
}
