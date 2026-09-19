import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SiteHeader } from "./site-header";

const route = vi.hoisted(() => ({ pathname: "/explore" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));

describe("site navigation", () => {
  it("exposes the current page and closes the menu with Escape while returning focus", () => {
    render(<SiteHeader />);
    const toggle = screen.getByRole("button", { name: "Menu" });

    expect(screen.getByRole("link", { name: "Explore" })).toHaveAttribute("aria-current", "page");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    const components = screen.getByRole("link", { name: "Components" });
    components.focus();
    fireEvent.keyDown(components, { key: "Escape" });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });

  it("closes when keyboard focus leaves navigation", () => {
    render(<><SiteHeader /><button type="button">Page content</button></>);
    const toggle = screen.getByRole("button", { name: "Menu" });
    fireEvent.click(toggle);
    fireEvent.blur(toggle, { relatedTarget: screen.getByRole("button", { name: "Page content" }) });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("does not leave the menu open after the route changes", () => {
    const { rerender } = render(<SiteHeader />);
    fireEvent.click(screen.getByRole("button", { name: "Menu" }));
    route.pathname = "/components";
    rerender(<SiteHeader />);

    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("link", { name: "Components" })).toHaveAttribute("aria-current", "page");
    route.pathname = "/explore";
    rerender(<SiteHeader />);
    expect(screen.getByRole("button", { name: "Menu" })).toHaveAttribute("aria-expanded", "false");
  });
});
