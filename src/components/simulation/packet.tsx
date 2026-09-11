import type { HttpMethod, PacketKind, PacketState } from "@/types/simulation";

type PacketProps = {
  kind: PacketKind;
  method?: HttpMethod;
  path?: string;
  statusCode?: number;
  state?: PacketState;
  compact?: boolean;
};

export function Packet({
  kind,
  method,
  path,
  statusCode,
  state = "idle",
  compact = false,
}: PacketProps) {
  const primary = kind === "request" ? method ?? "GET" : statusCode ?? 200;
  const secondary = kind === "request" ? path ?? "/api/profile" : "Response";

  return (
    <div
      aria-label={`${kind === "request" ? "HTTP request" : "HTTP response"}: ${primary} ${secondary}`}
      className={`packet packet-${kind} packet-${state} ${compact ? "packet-compact" : ""}`}
    >
      <span className="packet-direction" aria-hidden="true">
        {kind === "request" ? "→" : "←"}
      </span>
      <span className="packet-copy">
        <strong>{primary}</strong>
        <small>{secondary}</small>
      </span>
    </div>
  );
}
