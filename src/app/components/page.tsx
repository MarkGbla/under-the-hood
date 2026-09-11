import type { Metadata } from "next";
import { ApplicationError } from "@/components/simulation/application-error";
import { Connection } from "@/components/simulation/connection";
import { Flow, FlowArrow, FlowStage } from "@/components/simulation/flow";
import { HttpInspector } from "@/components/simulation/http-inspector";
import { Packet } from "@/components/simulation/packet";
import { StateSwatch } from "@/components/simulation/state-swatch";
import { StatusCode } from "@/components/simulation/status-code";
import { SystemNode } from "@/components/simulation/system-node";
import type { SystemNodeState } from "@/types/simulation";

export const metadata: Metadata = { title: "Component Playground" };

export default function ComponentsPage() {
  return (
    <div className="page-surface playground-page">
      <div className="site-shell">
        <header className="playground-header">
          <span className="kicker">Internal component playground</span>
          <h1>The system language.</h1>
          <p>Reusable primitives make every lesson feel like part of the same software world.</p>
        </header>

        <section className="showcase-section">
          <div className="showcase-heading"><span>01</span><div><h2>System nodes</h2><p>Core objects keep the same meaning across every lesson.</p></div></div>
          <div className="node-showcase">
            <SystemNode kind="browser" label="Browser" detail="Client application" />
            <SystemNode kind="server" label="Server" detail="Backend API" state="active" />
            <SystemNode kind="database" label="Database" detail="Stored records" state="success" />
            <SystemNode kind="middleware" label="Middleware" detail="Authentication" state="error" />
            <SystemNode kind="router" label="Router" detail="Matches route" />
            <SystemNode kind="controller" label="Controller" detail="Coordinates work" state="disabled" />
            <SystemNode kind="service" label="Service" detail="Business logic" />
            <SystemNode kind="user" label="User" detail="Mariama · Student" />
            <SystemNode kind="token" label="Token" detail="Simulated session" />
          </div>
        </section>

        <section className="showcase-section">
          <div className="showcase-heading"><span>02</span><div><h2>Shared interaction states</h2><p>Every state uses a word, border, shape, or icon as well as color.</p></div></div>
          <div className="state-showcase">
            {(["default", "loading", "active", "paused", "inspected", "success", "rejected", "error", "disabled"] satisfies SystemNodeState[]).map((state) => (
              <StateSwatch key={state} state={state} />
            ))}
          </div>
          <div className="node-state-showcase">
            <SystemNode kind="server" label="Loading server" detail="Fetching response" state="loading" />
            <SystemNode kind="middleware" label="Paused middleware" detail="Teaching checkpoint" state="paused" />
            <SystemNode kind="database" label="Inspected database" detail="Query details open" state="inspected" />
            <SystemNode kind="router" label="Rejected route" detail="No matching handler" state="rejected" />
          </div>
          <ApplicationError message="Example recoverable application error. The learner can still restart or navigate away." />
        </section>

        <section className="showcase-section">
          <div className="showcase-heading"><span>03</span><div><h2>Packets and connections</h2><p>Requests move out; responses return with an outcome.</p></div></div>
          <div className="packet-showcase">
            <Packet kind="request" method="GET" path="/api/profile" state="travelling" />
            <Connection label="HTTP request" active />
            <Packet kind="response" statusCode={200} state="success" />
            <Connection label="HTTP response" direction="back" />
            <Packet kind="response" statusCode={401} state="error" />
          </div>
        </section>

        <section className="showcase-section">
          <div className="showcase-heading"><span>04</span><div><h2>Responsive flow</h2><p>The same semantic sequence reads left-to-right on wide screens and top-to-bottom on phones.</p></div></div>
          <Flow label="Request lifecycle component example">
            <FlowStage number={1} label="Client"><SystemNode kind="browser" label="Browser" detail="Creates request" state="success" /></FlowStage>
            <FlowArrow label="POST /api/login" state="complete" />
            <FlowStage number={2} label="Guard"><SystemNode kind="middleware" label="Middleware" detail="Checks request" state="active" /></FlowStage>
            <FlowArrow label="Validated request" state="active" />
            <FlowStage number={3} label="Handler"><SystemNode kind="server" label="Server" detail="Runs login logic" /></FlowStage>
          </Flow>
        </section>

        <section className="showcase-section">
          <div className="showcase-heading"><span>05</span><div><h2>Inspectors</h2><p>Reveal only the technical details relevant to the current lesson.</p></div></div>
          <div className="inspector-showcase">
            <HttpInspector
              kind="request"
              headline="POST /api/login"
              headers={[{ name: "Content-Type", value: "application/json" }, { name: "Accept", value: "application/json" }]}
              body={'{\n  "email": "student@example.com",\n  "password": "••••••••"\n}'}
            />
            <HttpInspector
              kind="response"
              headline="200 OK"
              headers={[{ name: "Content-Type", value: "application/json" }]}
              body={'{\n  "authenticated": true\n}'}
            />
          </div>
        </section>

        <section className="showcase-section">
          <div className="showcase-heading"><span>06</span><div><h2>Status codes</h2><p>Color supports the explanation; it never replaces the words.</p></div></div>
          <div className="status-showcase">
            {[200, 201, 400, 401, 403, 404, 429, 500].map((code) => <StatusCode key={code} code={code} />)}
          </div>
        </section>

        <section className="showcase-section reduced-motion-showcase">
          <div className="showcase-heading"><span>07</span><div><h2>Reduced-motion model</h2><p>Movement becomes an ordered, numbered state change without removing information.</p></div></div>
          <ol className="static-event-sequence">
            <li><span>1</span><div><strong>Request created</strong><small>Browser prepares POST /api/login.</small></div></li>
            <li><span>2</span><div><strong>Request checked</strong><small>Middleware validates the payload.</small></div></li>
            <li><span>3</span><div><strong>Response returned</strong><small>The result and status code remain visible.</small></div></li>
          </ol>
        </section>
      </div>
    </div>
  );
}
