"use client";

import { useState } from "react";
import { SimulationCanvas } from "./simulation-canvas";
import { createSimulationStore } from "@/stores/simulation-store";
import { createLabRun } from "./create-lab-run";
import { StatusCode } from "@/components/simulation/status-code";
import type { CrudLabConfig, DatabaseRecord } from "@/types/lab";
import type { Lesson } from "@/types/lesson";
import type { UserRole } from "@/types/permission";
import type { HttpMethod } from "@/types/simulation";

type Operation = "create" | "read" | "update" | "delete";

const operationCopy: Record<Operation, { verb: string; http: string; sql: string }> = {
  create: { verb: "Create", http: "POST /api/users", sql: "INSERT" },
  read: { verb: "Read", http: "GET /api/users/:id", sql: "SELECT" },
  update: { verb: "Update", http: "PATCH /api/users/:id", sql: "UPDATE" },
  delete: { verb: "Delete", http: "DELETE /api/users/:id", sql: "DELETE" },
};

export function CrudLab({ lesson, config, onInteraction }: { lesson: Lesson; config: CrudLabConfig; onInteraction: () => void }) {
  const [store, setStore] = useState(() => createSimulationStore(lesson.simulation));
  const [records, setRecords] = useState<DatabaseRecord[]>(config.initialRecords);
  const [selectedId, setSelectedId] = useState<number | null>(config.initialRecords[0]?.id ?? null);
  const [name, setName] = useState("Ibrahim");
  const [role, setRole] = useState<UserRole>("student");
  const [outcome, setOutcome] = useState<{ status: 200 | 201 | 400 | 404; message: string } | null>(null);

  const selected = records.find((record) => record.id === selectedId) ?? null;

  function runSimulation(operation: Operation, status: 200 | 201 | 400 | 404, message: string, result: unknown, requestBody?: unknown, recordId = selectedId) {
    const method = operationCopy[operation].http.split(" ")[0] as HttpMethod;
    setStore(createLabRun({
      definition: lesson.simulation,
      speed: store.getState().speed,
      failure: status === 400 ? "invalid-request" : status === 404 ? "missing-route" : null,
      request: { method, path: operation === "create" ? "/api/users" : `/api/users/${recordId ?? ":id"}`, body: requestBody ? JSON.stringify(requestBody, null, 2) : undefined },
      response: { statusCode: status, body: JSON.stringify(result, null, 2) },
      mapStep: (step) => step.id === "database-query" ? {
        ...step, title: `${operationCopy[operation].sql} users`, description: message, payload: undefined, inspectable: false,
      } : step,
    }));
    setOutcome({ status, message });
    onInteraction();
  }

  function apply(operation: Operation, recordName = name) {
    if (operation === "create") {
      if (!recordName.trim()) {
        runSimulation(operation, 400, "Name is required.", { error: "name is required" }, { name: recordName, role });
        return;
      }
      const nextId = records.reduce((highest, record) => Math.max(highest, record.id), 0) + 1;
      const record = { id: nextId, name: recordName.trim(), role };
      setRecords([...records, record]);
      setSelectedId(nextId);
      runSimulation(operation, 201, `INSERT ${recordName.trim()} · ${records.length + 1} rows`, record, { name: recordName.trim(), role });
      return;
    }

    if (!selected) {
      runSimulation(operation, 404, "No record selected.", { error: "record not found" });
      return;
    }

    if (operation === "read") {
      runSimulation(operation, 200, `SELECT ${selected.name} · no rows changed`, selected);
    }
    if (operation === "update") {
      const nextRole: UserRole = selected.role === "student" ? "instructor" : "student";
      setRecords(records.map((record) => record.id === selected.id ? { ...record, role: nextRole } : record));
      runSimulation(operation, 200, `UPDATE ${selected.name} · ${selected.role} → ${nextRole}`, { ...selected, role: nextRole }, { role: nextRole });
    }
    if (operation === "delete") {
      setRecords(records.filter((record) => record.id !== selected.id));
      setSelectedId(null);
      runSimulation(operation, 200, `DELETE ${selected.name} · row removed`, { deleted: selected.id });
    }
  }

  function reset() {
    setRecords(config.initialRecords);
    setSelectedId(config.initialRecords[0]?.id ?? null);
    setOutcome(null);
    setStore(createSimulationStore(lesson.simulation));
    onInteraction();
  }

  function retry() {
    if (outcome?.status === 400) {
      const validName = name.trim() || "Ibrahim";
      setName(validName);
      apply("create", validName);
      return;
    }
    const record = records[0] ?? config.initialRecords[0];
    if (!records.length) setRecords(config.initialRecords);
    setSelectedId(record.id);
    runSimulation("read", 200, `SELECT ${record.name} · no rows changed`, record, undefined, record.id);
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
                    <button type="button" aria-label={`Select ${record.name}, record ${record.id}`} aria-pressed={record.id === selectedId} onClick={() => { setSelectedId(record.id); onInteraction(); }}>
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
        <div className="http-outcome" role="status">
          <StatusCode code={outcome.status} />
          <p>{outcome.message}</p>
        </div>
      ) : null}

      <SimulationCanvas
        store={store} nodes={lesson.visualNodes} label={lesson.title} onInteraction={onInteraction}
        onRunWorkingVersion={retry}
        onTriggerFailure={() => { setName(""); apply("create", ""); }}
      />
    </div>
  );
}
