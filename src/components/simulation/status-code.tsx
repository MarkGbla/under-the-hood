const statusMessages: Record<number, { title: string; explanation: string }> = {
  200: { title: "OK", explanation: "The request succeeded." },
  201: { title: "Created", explanation: "The server created a new resource." },
  400: { title: "Bad Request", explanation: "The server could not use the request as sent." },
  401: { title: "Unauthorized", explanation: "The server cannot verify who is making this request." },
  403: { title: "Forbidden", explanation: "The user is known but does not have permission for this action." },
  404: { title: "Not Found", explanation: "The requested route or resource does not exist." },
  409: { title: "Conflict", explanation: "The request conflicts with an existing resource." },
  429: { title: "Too Many Requests", explanation: "The client has sent too many requests in a short time." },
  500: { title: "Internal Server Error", explanation: "The server encountered an unexpected problem." },
};

/** The standard HTTP reason phrase, so status lines read as they really would. */
export function statusReason(code: number) {
  return statusMessages[code]?.title ?? "Unknown Status";
}

type StatusCodeProps = {
  code: keyof typeof statusMessages;
};

export function StatusCode({ code }: StatusCodeProps) {
  const status = statusMessages[code];
  const tone = code < 300 ? "success" : code < 500 ? "warning" : "error";

  return (
    <div className={`status-code status-${tone}`}>
      <strong>{code}</strong>
      <div>
        <span>{status.title}</span>
        <p>{status.explanation}</p>
      </div>
    </div>
  );
}
