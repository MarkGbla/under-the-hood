"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Connection } from "./connection";
import { Packet } from "./packet";
import { SystemNode } from "./system-node";

export function SystemFlowPreview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="hero-lab" aria-label="Preview of an HTTP request moving from a browser to a server and database">
      <div className="lab-topbar">
        <span><i className="status-dot" /> Live system</span>
        <span className="lab-mode">Explore mode</span>
      </div>
      <div className="hero-flow">
        <SystemNode kind="browser" label="Browser" detail="Client" compact />
        <Connection label="HTTP" active />
        <SystemNode kind="server" label="Server" detail="API" compact state="active" />
        <Connection label="Query" />
        <SystemNode kind="database" label="Database" detail="Users" compact />
        <motion.div
          className="hero-packet"
          initial={{ left: "17%", opacity: 0 }}
          animate={shouldReduceMotion ? { left: "47%", opacity: 1 } : { left: ["17%", "47%", "77%"], opacity: [0, 1, 1, 0] }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 4.2, repeat: Infinity, times: [0, 0.15, 0.75, 1], ease: "easeInOut" }}
        >
          <Packet kind="request" method="GET" path="/profile" compact state="travelling" />
        </motion.div>
      </div>
      <div className="lab-event">
        <span className="event-index">03</span>
        <div>
          <strong>The server received the request</strong>
          <p>It will check the route before asking for data.</p>
        </div>
        <button type="button" aria-label="Pause preview">Pause</button>
      </div>
    </div>
  );
}
