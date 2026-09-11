import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LoginSimulation } from "./login-simulation";
import { loginSimulationStore, signupSimulationStore } from "@/simulations/login/login-store";

describe("login simulation", () => {
  beforeEach(() => {
    window.localStorage.clear();
    loginSimulationStore.getState().restart();
    signupSimulationStore.getState().restart();
  });

  afterEach(() => {
    act(() => {
      loginSimulationStore.getState().restart();
      signupSimulationStore.getState().restart();
    });
  });

  it("moves from wrong password and 401 failure to a corrected successful login", () => {
    render(<LoginSimulation />);
    fireEvent.click(screen.getByRole("button", { name: "Explore myself" }));
    fireEvent.click(screen.getByRole("button", { name: "Use wrong password" }));
    fireEvent.click(screen.getByRole("button", { name: "Start login" }));

    act(() => {
      for (let step = 0; step < 8; step += 1) loginSimulationStore.getState().next();
    });

    expect(loginSimulationStore.getState()).toMatchObject({ status: "failed" });
    expect(screen.getByText("401 Unauthorized")).toBeInTheDocument();
    expect(screen.getByText("Password rejected")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Use correct password and retry" }));
    act(() => {
      for (let step = 0; step < 20; step += 1) loginSimulationStore.getState().next();
    });

    expect(loginSimulationStore.getState()).toMatchObject({ status: "completed" });
    expect(screen.getByRole("heading", { name: "Welcome, student" })).toBeInTheDocument();
    expect(screen.getByText("Authentication succeeded")).toBeInTheDocument();
  });

  it("switches to the sign-up system and creates a simulated account", () => {
    render(<LoginSimulation />);
    fireEvent.click(screen.getByRole("button", { name: "Explore myself" }));
    fireEvent.click(screen.getByRole("tab", { name: "Sign up" }));

    expect(screen.getByRole("heading", { name: "Create your account" })).toBeInTheDocument();
    expect(screen.getByText("/api/signup")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Create account" }));
    act(() => {
      for (let step = 0; step < 20; step += 1) signupSimulationStore.getState().next();
    });

    expect(signupSimulationStore.getState()).toMatchObject({ status: "completed" });
    expect(screen.getByRole("heading", { name: "Account created" })).toBeInTheDocument();
    expect(screen.getAllByText("201").length).toBeGreaterThan(0);
    expect(screen.getByText("Created")).toBeInTheDocument();
    expect(screen.getByText("Account creation succeeded")).toBeInTheDocument();
  });

  it("stops sign up at the duplicate-email check", () => {
    render(<LoginSimulation />);
    fireEvent.click(screen.getByRole("button", { name: "Explore myself" }));
    fireEvent.click(screen.getByRole("tab", { name: "Sign up" }));
    fireEvent.click(screen.getByRole("button", { name: "Use existing email" }));
    fireEvent.click(screen.getByRole("button", { name: "Create account" }));

    act(() => {
      for (let step = 0; step < 12; step += 1) signupSimulationStore.getState().next();
    });

    expect(signupSimulationStore.getState()).toMatchObject({ status: "failed" });
    expect(screen.getByText("409 Conflict")).toBeInTheDocument();
    expect(screen.getByText("Email already registered")).toBeInTheDocument();
  });
});
