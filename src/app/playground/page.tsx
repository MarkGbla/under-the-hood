import type { Metadata } from "next";
import { SystemBuilder } from "@/components/playground/system-builder";

export const metadata: Metadata = {
  title: "System Playground",
  description: "Draw, connect, test, and teach visual software systems.",
};

export default function PlaygroundPage() {
  return (
    <div className="playground-app">
      <SystemBuilder />
    </div>
  );
}
