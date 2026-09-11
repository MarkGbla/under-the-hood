"use client";

import { useState } from "react";
import { SimulationCanvas, useLabSimulation } from "./simulation-canvas";
import { StatusCode } from "@/components/simulation/status-code";
import type { CrudLabConfig, DatabaseRecord } from "@/types/lab";
import type { Lesson } from "@/types/lesson";
import type { UserRole } from "@/types/permission";

type Operation = "create" | "read" | "update" | "delete";

const operationCopy: Record<Operation, { verb: string; http: string; sql: string }> = {
  create: { verb: "Create", http: "POST /api/users", sql: "INSERT" },
  read: { verb: "Read", http: "GET /api/users/:id", sql: "SELECT" },
  update: { verb: "Update", http: "PATCH /api/users/:id", sql: "UPDATE" },
  delete: { verb: "Delete", http: "DELETE /api/users/:id", sql: "DELETE" },
};

export function CrudLab({ lesson, config, onInteraction }: { lesson: Lesson; config: CrudLabConfig; onInteraction: () => void }) {
  const store = useLabSimulation(lesson.simulation);
  const [records, setRecords] = useState<DatabaseRecord[]>(config.initialRecords);
  const [selectedId, setSelectedId] = useState<number | null>(config.initialRecords[0]?.id ?? null);
  const [name, setName] = useState("Ibrahim");
  const [role, setRole] = useState<UserRole>("student");
  const [outcome, setOutcome] = useState<{ status: 200 | 201 | 400 | 404; message: string } | null>(null);

  const selected = records.find((record) => record.id === selectedId) ?? null;

  function runSimulation(failure: "invalid-request" | "missing-route" | null) {
    store.getState().restart();
    store.getState().triggerFailure(failure);
    store.getState().play();
    onInteraction();
  }

  function apply(operation: Operation) {
    if (operation === "create") {
      if (!name.trim()) {
        setOutcome({ status: 400, message: "Name is required." });
        runSimulation("invalid-request");
        return;
      }
      const nextId = records.reduce((highest, record) => Math.max(highest, record.id), 0) + 1;
      setRecords([...records, { id: nextId, name: name.trim(), role }]);
      setSelectedId(nextId);
      setOutcome({ status: 201, message: `INSERT ${name.trim()} · ${records.length + 1} rows` });
      runSimulation(null);
      return;
    }

    if (!selected) {
      setOutcome({ status: 404, message: "No record selected." });
      runSimulation("missing-route");
      return;
    }

    if (operation === "read") {
      setOutcome({ status: 200, message: `SELECT ${selected.name} · no rows changed` });
    }
    if (operation === "update") {
      const nextRole: UserRole = selected.role === "student" ? "instructor" : "student";
      setRecords(records.map((record) => record.id === selected.id ? { ...record, role: nextRole } : record));
      setOutcome({ status: 200, message: `UPDATE ${selected.name} · ${selected.role} → ${nextRole}` });
    }
    if (operation === "delete") {
      setRecords(records.filter((record) => record.id !== selected.id));
      setSelectedId(null);
      setOutcome({ status: 200, message: `DELETE ${selected.name} · row removed` });
    }
    runSimulation(null);
  }

  function reset() {
    setRecords(config.initialRecords);
    setSelectedId(config.initialRecords[0]?.id ?? null);
    setOutcome(null);
    store.getState().restart();
    onInteraction();
  }

  return (
    <div className="lab-shell">
      <div className="crud-grid">
        <div className="crud-table-panel">
          <div className="crud-table-heading"><strong>users</strong><button type="button" onClick={reset}>Reset data</button></div>
          <table className="crud-table">
            <caption className="visually-hidden">Simulated users table</caption>
            <thead><tr><th scope="col">ID</th><th scope="col">Name</th><th scope="col">Role</th><th scope="col"><span className="visually-hidden">Select</span></th></tr></thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className={record.id === selectedId ? "row-selected" : ""}>
                  <td>{record.id}</td>
                  <td>{record.name}</td>
                  <td>{record.role}</td>
                  <td>
                    <button type="button" aria-pressed={record.id === selectedId} onClick={() => { setSelectedId(record.id); onInteraction(); }}>
                      {record.id === selectedId ? "Selected" : "Select"}
                    </button>
                  </td>
                </tr>
              ))}
              {records.length === 0 ? <tr><td colSpan={4}>No records. Create one, or reset the data.</td></tr> : null}
            </tbody>
          </table>
        </div>

        <div className="crud-controls">
          <label>New record name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label>New record role
            <select value={role} onChange={(event) => setRole(event.target.value as UserRole)}>
              <option value="student">student</option>
              <option value="instructor">instructor</option>
              <option value="admin">admin</option>
            </select>
          </label>
          <div className="crud-operations">
            {(Object.keys(operationCopy) as Operation[]).map((operation) => (
              <button key={operation} type="button" onClick={() => apply(operation)}>
                <strong>{operationCopy[operation].verb}</strong>
                <small>{operationCopy[operation].http}</small>
              </button>
            ))}
          </div>
        </div>
      </div>

      {outcome ? (
        <div className="http-outcome">
          <StatusCode code={outcome.status} />
          <p>{outcome.message}</p>
        </div>
      ) : null}

      <SimulationCanvas store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction} />
    </div>
  );
}
