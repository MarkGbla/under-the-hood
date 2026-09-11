type ApplicationErrorProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ApplicationError({
  title = "The lab could not continue",
  message = "Your progress is safe. Restart this simulation or try the action again.",
  onRetry,
}: ApplicationErrorProps) {
  return (
    <div className="application-error" role="alert">
      <span aria-hidden="true">!</span>
      <div><strong>{title}</strong><p>{message}</p></div>
      {onRetry ? <button type="button" onClick={onRetry}>Try again</button> : null}
    </div>
  );
}
