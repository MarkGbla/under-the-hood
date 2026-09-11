import type { Metadata } from "next";
import { LoginCapstone } from "@/components/simulation/login-capstone";

export const metadata: Metadata = { title: "Login & Sign-up Lab" };

export default function LoginSimulationPage() {
  return <LoginCapstone />;
}
