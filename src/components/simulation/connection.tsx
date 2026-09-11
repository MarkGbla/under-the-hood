type ConnectionProps = {
  label?: string;
  direction?: "forward" | "back";
  active?: boolean;
};

export function Connection({ label, direction = "forward", active = false }: ConnectionProps) {
  return (
    <div className={`connection ${active ? "connection-active" : ""}`} aria-hidden="true">
      {label ? <span>{label}</span> : null}
      <div className="connection-line">
        <i />
        <b>{direction === "forward" ? "›" : "‹"}</b>
      </div>
    </div>
  );
}
