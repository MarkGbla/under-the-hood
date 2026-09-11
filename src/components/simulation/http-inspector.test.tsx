import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HttpInspector } from "./http-inspector";

describe("HttpInspector", () => {
  it("labels request details without exposing an unmasked password", () => {
    const { container } = render(
      <HttpInspector
        kind="request"
        headline="POST /api/login"
        headers={[{ name: "Content-Type", value: "application/json" }]}
        body={'{ "password": "••••••••" }'}
      />,
    );

    expect(screen.getByRole("region", { name: "HTTP request inspector" })).toBeInTheDocument();
    expect(screen.getByText("POST /api/login")).toBeInTheDocument();
    expect(container).not.toHaveTextContent("not-a-real-password");
  });
});
