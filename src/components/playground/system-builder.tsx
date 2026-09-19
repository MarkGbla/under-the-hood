"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent } from "react";
import { NodeIcon } from "@/components/simulation/node-icon";
import { Packet } from "@/components/simulation/packet";
import { StatusCode } from "@/components/simulation/status-code";
import { SystemNode } from "@/components/simulation/system-node";
import {
  buildStarterConnections,
  buildStarterSystem,
  builderComponents,
  evaluateConnectedSystem,
  getBuilderComponent,
  getBuilderMission,
  inspectConnectedSystem,
  type BuilderComponentKind,
  type BuilderConnection,
  type BuilderMissionId,
  type BuilderNode,
  type BuilderResult,
} from "@/playground/system-builder";
import { isTypingTarget } from "@/hooks/use-presentation-mode";
import type { SystemNodeState } from "@/types/simulation";

type RunStatus = "idle" | "running" | "paused" | "success" | "failed";
type CanvasTool = "select" | "connect";
type CanvasNode = BuilderNode & { x: number; y: number };

type DragState = {
  nodeId: string;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  moved: boolean;
};

const MIN_CANVAS_WIDTH = 1280;
const MIN_CANVAS_HEIGHT = 540;
/** Always keep open space beyond the furthest component so a drag never hits a wall. */
const CANVAS_HEADROOM = 420;
const NODE_WIDTH = 150;
const NODE_HEIGHT = 116;

const runLabels: Record<RunStatus, string> = {
  idle: "Ready to test",
  running: "Request moving",
  paused: "Paused for inspection",
  success: "Test passed",
  failed: "Test failed",
};

function terminalIndex(result: BuilderResult) {
  if (result.failingNodeId) {
    const index = result.trace.findIndex((step) => step.nodeId === result.failingNodeId);
    if (index >= 0) return index;
  }
  return Math.max(0, result.trace.length - 1);
}

function arrangeNodes(nodes: readonly BuilderNode[]): CanvasNode[] {
  const columns = Math.min(6, Math.max(1, nodes.length));
  const gap = columns > 1 ? Math.min(200, (MIN_CANVAS_WIDTH - 220) / (columns - 1)) : 0;
  return nodes.map((node, index) => ({
    ...node,
    x: Math.round(70 + (index % 6) * gap),
    y: 190 + Math.floor(index / 6) * 170,
  }));
}

function createStarterGraph(missionId: BuilderMissionId, broken = false) {
  const nodes = arrangeNodes(buildStarterSystem(missionId, broken));
  return { nodes, connections: buildStarterConnections(nodes) };
}

const INITIAL_STARTER = createStarterGraph("login");

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function SystemBuilder() {
  const dragState = useRef<DragState | null>(null);
  const justDragged = useRef(false);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const panState = useRef<{ x: number; y: number; left: number; top: number; moved: boolean } | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const [connectDrag, setConnectDrag] = useState<{ sourceId: string; x: number; y: number; overId: string | null } | null>(null);
  const [tool, setTool] = useState<CanvasTool>("select");
  const missionId: BuilderMissionId = "login";
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL_STARTER.nodes);
  const [connections, setConnections] = useState<BuilderConnection[]>(INITIAL_STARTER.connections);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(INITIAL_STARTER.nodes[0]?.id ?? null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectionSourceId, setConnectionSourceId] = useState<string | null>(null);
  const [result, setResult] = useState<BuilderResult | null>(null);
  const [runStatus, setRunStatus] = useState<RunStatus>("idle");
  const [currentStep, setCurrentStep] = useState(-1);
  const [nextNodeId, setNextNodeId] = useState(20);
  const [zoom, setZoom] = useState(0.9);
  const [componentSearch, setComponentSearch] = useState("");
  const [libraryOpen, setLibraryOpen] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(false);

  const mission = getBuilderMission(missionId);
  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const selectedDefinition = selectedNode ? getBuilderComponent(selectedNode.kind) : null;
  const inspection = useMemo(
    () => inspectConnectedSystem(nodes, connections, missionId),
    [connections, missionId, nodes],
  );
  const designIssues = inspection.issues;
  const canvasSize = useMemo(() => ({
    width: Math.max(MIN_CANVAS_WIDTH, ...nodes.map((node) => node.x + NODE_WIDTH + CANVAS_HEADROOM)),
    height: Math.max(MIN_CANVAS_HEIGHT, ...nodes.map((node) => node.y + NODE_HEIGHT + CANVAS_HEADROOM)),
  }), [nodes]);
  const filteredComponents = useMemo(() => {
    const query = componentSearch.trim().toLowerCase();
    return builderComponents.filter((component) => (
      !query || `${component.name} ${component.purpose}`.toLowerCase().includes(query)
    ));
  }, [componentSearch]);

  useEffect(() => {
    if (runStatus !== "running" || !result || result.kind === "design-error") return;
    const lastVisibleStep = terminalIndex(result);
    const timer = window.setTimeout(() => {
      if (currentStep >= lastVisibleStep) {
        setRunStatus(result.kind === "success" ? "success" : "failed");
        if (result.kind === "runtime-error" && result.failingNodeId) setSelectedNodeId(result.failingNodeId);
        return;
      }
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      if (nextStep >= lastVisibleStep) {
        setRunStatus(result.kind === "success" ? "success" : "failed");
        if (result.kind === "runtime-error" && result.failingNodeId) setSelectedNodeId(result.failingNodeId);
      }
    }, 720);
    return () => window.clearTimeout(timer);
  }, [currentStep, result, runStatus]);

  useEffect(() => {
    if (!connectDrag) return;
    const sourceId = connectDrag.sourceId;

    function handleMove(event: globalThis.PointerEvent) {
      const point = canvasPoint(event.clientX, event.clientY);
      const hovered = nodeIdAtPoint(event.clientX, event.clientY);
      setConnectDrag((current) => current && ({
        ...current,
        x: point.x,
        y: point.y,
        overId: hovered && hovered !== sourceId ? hovered : null,
      }));
    }

    function handleUp(event: globalThis.PointerEvent) {
      const target = nodeIdAtPoint(event.clientX, event.clientY);
      setConnectDrag(null);
      if (target && target !== sourceId) {
        connectNodes(sourceId, target);
      }
      // Released on empty space: keep the source armed so a following click on
      // a component still completes the connection.
    }

    function handleCancel(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      setConnectDrag(null);
      setConnectionSourceId(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("keydown", handleCancel);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("keydown", handleCancel);
    };
    // Re-binding on every pointermove (connectDrag.x/y changes constantly)
    // would detach the listeners mid-gesture, so the drag is keyed to its source.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectDrag?.sourceId, zoom]);

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (isTypingTarget(event.target)) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const step = event.shiftKey ? 40 : 8;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-step, 0],
        ArrowRight: [step, 0],
        ArrowUp: [0, -step],
        ArrowDown: [0, step],
      };

      if (moves[event.key]) {
        if (!selectedNodeId) return;
        event.preventDefault();
        nudgeSelected(...moves[event.key]);
        return;
      }

      switch (event.key) {
        case "Delete":
        case "Backspace":
          if (!selectedNodeId && !selectedConnectionId) return;
          event.preventDefault();
          deleteSelection();
          return;
        case "Escape":
          event.preventDefault();
          setConnectDrag(null);
          setConnectionSourceId(null);
          setSelectedConnectionId(null);
          setTool("select");
          return;
        case "v":
        case "V":
          event.preventDefault();
          setTool("select");
          setConnectionSourceId(null);
          return;
        case "c":
        case "C":
          event.preventDefault();
          setTool("connect");
          setConnectionSourceId(null);
          return;
        case "t":
        case "T":
          event.preventDefault();
          testSystem();
          return;
        case "a":
        case "A":
          event.preventDefault();
          autoArrange();
          return;
        case "f":
        case "F":
          event.preventDefault();
          fitToContent();
          return;
        case "+":
        case "=":
          event.preventDefault();
          setZoom((value) => clamp(Number((value + 0.1).toFixed(1)), 0.3, 1.2));
          return;
        case "-":
        case "_":
          event.preventDefault();
          setZoom((value) => clamp(Number((value - 0.1).toFixed(1)), 0.3, 1.2));
          return;
        case "0":
          event.preventDefault();
          setZoom(0.9);
          return;
        default:
      }
    }

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
    // Re-binding on every node move would be wasteful; handlers read live state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNodeId, selectedConnectionId, nodes, connections, result, runStatus, currentStep, zoom]);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const timer = window.setTimeout(() => {
      if (window.matchMedia("(max-width: 760px)").matches) {
        setLibraryOpen(false);
        setInspectorOpen(false);
      } else if (window.matchMedia("(max-width: 1040px)").matches) {
        setInspectorOpen(false);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function canvasPoint(clientX: number, clientY: number) {
    const surface = surfaceRef.current;
    if (!surface) return { x: 0, y: 0 };
    const bounds = surface.getBoundingClientRect();
    return { x: (clientX - bounds.left) / zoom, y: (clientY - bounds.top) / zoom };
  }

  function nodeIdAtPoint(clientX: number, clientY: number) {
    const element = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
    return element?.closest<HTMLElement>("[data-node-id]")?.dataset.nodeId ?? null;
  }

  function invalidateRun() {
    setResult(null);
    setRunStatus("idle");
    setCurrentStep(-1);
  }

  function replaceGraph(nextNodes: BuilderNode[], nextConnections: BuilderConnection[]) {
    const positioned = arrangeNodes(nextNodes);
    setNodes(positioned);
    setConnections(nextConnections);
    setSelectedNodeId(positioned[0]?.id ?? null);
    setSelectedConnectionId(null);
    setConnectionSourceId(null);
    setTool("select");
    invalidateRun();
  }

  function loadTemplate(kind: "working" | "broken" | "blank") {
    if (kind === "blank") {
      replaceGraph([], []);
      return;
    }
    const next = createStarterGraph(missionId, kind === "broken");
    replaceGraph(next.nodes, next.connections);
  }

  function toggleLibrary() {
    const nextOpen = !libraryOpen;
    setLibraryOpen(nextOpen);
    if (nextOpen && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 1040px)").matches) {
      setInspectorOpen(false);
    }
  }

  function toggleInspector() {
    const nextOpen = !inspectorOpen;
    setInspectorOpen(nextOpen);
    if (nextOpen && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 1040px)").matches) {
      setLibraryOpen(false);
    }
  }

  function nextOpenPosition() {
    const index = nodes.length;
    return { x: 70 + (index % 6) * 190, y: 70 + Math.floor(index / 6) * 165 };
  }

  function addNode(kind: BuilderComponentKind, position = nextOpenPosition()) {
    const node: CanvasNode = {
      id: `${kind}-${nextNodeId}`,
      kind,
      working: true,
      x: Math.max(0, Math.round(position.x)),
      y: Math.max(0, Math.round(position.y)),
    };
    setNextNodeId((value) => value + 1);
    setNodes((current) => [...current, node]);
    if (connectionSourceId && connectionSourceId !== node.id) {
      setConnections((current) => [...current, {
        id: `connection-${connectionSourceId}-${node.id}-${nextNodeId}`,
        sourceNodeId: connectionSourceId,
        targetNodeId: node.id,
      }]);
      setConnectionSourceId(null);
      setTool("select");
    }
    setSelectedNodeId(node.id);
    setSelectedConnectionId(null);
    invalidateRun();
  }

  function updateNode(nodeId: string, patch: Partial<BuilderNode>) {
    setNodes((current) => current.map((node) => node.id === nodeId ? { ...node, ...patch } : node));
    invalidateRun();
  }

  function removeNode(nodeId: string) {
    setNodes((current) => current.filter((node) => node.id !== nodeId));
    setConnections((current) => current.filter((connection) => connection.sourceNodeId !== nodeId && connection.targetNodeId !== nodeId));
    setSelectedNodeId(null);
    setConnectionSourceId((current) => current === nodeId ? null : current);
    invalidateRun();
  }

  function removeConnection(connectionId: string) {
    setConnections((current) => current.filter((connection) => connection.id !== connectionId));
    setSelectedConnectionId(null);
    invalidateRun();
  }

  function deleteSelection() {
    if (selectedNodeId) removeNode(selectedNodeId);
    else if (selectedConnectionId) removeConnection(selectedConnectionId);
  }

  function connectNodes(sourceNodeId: string, targetNodeId: string) {
    if (sourceNodeId === targetNodeId) return;
    setConnections((current) => {
      const existing = current.some((connection) => connection.sourceNodeId === sourceNodeId && connection.targetNodeId === targetNodeId);
      if (existing) return current;
      return [...current, {
        id: `connection-${sourceNodeId}-${targetNodeId}-${current.length + 1}`,
        sourceNodeId,
        targetNodeId,
      }];
    });
    setConnectionSourceId(null);
    setSelectedConnectionId(null);
    setTool("select");
    invalidateRun();
  }

  function activateNode(nodeId: string) {
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    if (tool === "connect") {
      if (!connectionSourceId) {
        setConnectionSourceId(nodeId);
        setSelectedNodeId(nodeId);
      } else {
        connectNodes(connectionSourceId, nodeId);
        setSelectedNodeId(nodeId);
      }
      return;
    }
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
  }

  function startConnection(nodeId: string) {
    setTool("connect");
    setConnectionSourceId(nodeId);
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
  }

  function handleNodePointerDown(event: PointerEvent<HTMLButtonElement>, node: CanvasNode) {
    if (event.button !== 0 || tool !== "select" || runStatus === "running") return;
    dragState.current = {
      nodeId: node.id,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: node.x,
      startY: node.y,
      moved: false,
    };
    // Pointer capture is an enhancement: it keeps the drag alive when the
    // cursor leaves the node. It throws for an unknown pointerId and is absent
    // in some environments, so a failure here must not abort the drag.
    try {
      event.currentTarget.setPointerCapture?.(event.pointerId);
    } catch {
      // Drag still works through the element's own pointermove events.
    }
  }

  /** Scroll the viewport when a drag reaches its edge, so the surface keeps opening up. */
  function autoScrollViewport(clientX: number, clientY: number) {
    const viewport = canvasRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const margin = 72;
    const speed = 22;
    let deltaX = 0;
    let deltaY = 0;
    if (clientX < bounds.left + margin) deltaX = -speed;
    else if (clientX > bounds.right - margin) deltaX = speed;
    if (clientY < bounds.top + margin) deltaY = -speed;
    else if (clientY > bounds.bottom - margin) deltaY = speed;
    if (deltaX !== 0) viewport.scrollLeft += deltaX;
    if (deltaY !== 0) viewport.scrollTop += deltaY;
  }

  function handleNodePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const dragging = dragState.current;
    if (!dragging || dragging.nodeId !== event.currentTarget.dataset.nodeId) return;
    const deltaX = (event.clientX - dragging.startClientX) / zoom;
    const deltaY = (event.clientY - dragging.startClientY) / zoom;
    if (!dragging.moved && Math.abs(deltaX) + Math.abs(deltaY) > 3) {
      dragging.moved = true;
      invalidateRun();
    }
    if (!dragging.moved) return;
    autoScrollViewport(event.clientX, event.clientY);
    setNodes((current) => current.map((node) => node.id === dragging.nodeId ? {
      ...node,
      x: Math.max(0, Math.round(dragging.startX + deltaX)),
      y: Math.max(0, Math.round(dragging.startY + deltaY)),
    } : node));
  }

  function handleNodePointerUp(event: PointerEvent<HTMLButtonElement>) {
    const dragging = dragState.current;
    if (!dragging || dragging.nodeId !== event.currentTarget.dataset.nodeId) return;
    // A drag must not also register as a click, or dropping a node re-triggers
    // selection (and, in connect mode, would wire up an unintended connector).
    justDragged.current = dragging.moved;
    dragState.current = null;
  }

  function nudgeSelected(deltaX: number, deltaY: number) {
    if (!selectedNodeId) return;
    setNodes((current) => current.map((node) => node.id === selectedNodeId ? {
      ...node,
      x: Math.max(0, node.x + deltaX),
      y: Math.max(0, node.y + deltaY),
    } : node));
    invalidateRun();
  }

  function autoArrange() {
    const ordered = [
      ...inspection.path,
      ...nodes.filter((node) => !inspection.path.some((pathNode) => pathNode.id === node.id)),
    ];
    const positions = new Map(arrangeNodes(ordered).map((node) => [node.id, { x: node.x, y: node.y }]));
    setNodes((current) => current.map((node) => ({ ...node, ...(positions.get(node.id) ?? {}) })));
    invalidateRun();
  }

  function clearCanvas() {
    replaceGraph([], []);
  }

  function startConnectDrag(event: PointerEvent<HTMLButtonElement>, nodeId: string) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    const point = canvasPoint(event.clientX, event.clientY);
    setConnectDrag({ sourceId: nodeId, x: point.x, y: point.y, overId: null });
    setConnectionSourceId(nodeId);
    setSelectedNodeId(nodeId);
    setSelectedConnectionId(null);
  }

  function handleCanvasPointerDown(event: PointerEvent<HTMLDivElement>) {
    // Only empty canvas starts a pan; pointerdown on a node must still drag it.
    if (event.target !== event.currentTarget || event.button !== 0) return;
    const viewport = canvasRef.current;
    if (!viewport) return;
    panState.current = {
      x: event.clientX,
      y: event.clientY,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
      moved: false,
    };
  }

  function handleCanvasPointerMove(event: PointerEvent<HTMLDivElement>) {
    const panning = panState.current;
    const viewport = canvasRef.current;
    if (!panning || !viewport) return;
    const deltaX = event.clientX - panning.x;
    const deltaY = event.clientY - panning.y;
    if (!panning.moved && Math.abs(deltaX) + Math.abs(deltaY) < 4) return;
    panning.moved = true;
    viewport.scrollLeft = panning.left - deltaX;
    viewport.scrollTop = panning.top - deltaY;
  }

  function handleCanvasPointerUp() {
    panState.current = null;
  }

  /** Zoom and scroll so every component is visible at once. */
  function fitToContent() {
    const viewport = canvasRef.current;
    if (!viewport || nodes.length === 0) {
      setZoom(0.9);
      return;
    }
    const right = Math.max(...nodes.map((node) => node.x + NODE_WIDTH));
    const bottom = Math.max(...nodes.map((node) => node.y + NODE_HEIGHT));
    const left = Math.min(...nodes.map((node) => node.x));
    const top = Math.min(...nodes.map((node) => node.y));
    const padding = 80;
    const nextZoom = clamp(
      Number(Math.min(
        viewport.clientWidth / (right - left + padding * 2),
        viewport.clientHeight / (bottom - top + padding * 2),
      ).toFixed(2)),
      0.3,
      1.2,
    );
    setZoom(nextZoom);
    window.requestAnimationFrame(() => {
      viewport.scrollLeft = Math.max(0, (left - padding) * nextZoom);
      viewport.scrollTop = Math.max(0, (top - padding) * nextZoom);
    });
  }

  /** Arrow keys nudge, Shift+arrows move further, Delete removes, Escape cancels. */
  function handleCanvasKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;

    const step = event.shiftKey ? 40 : 8;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };

    if (moves[event.key] && selectedNodeId) {
      event.preventDefault();
      nudgeSelected(...moves[event.key]);
      return;
    }
    if ((event.key === "Delete" || event.key === "Backspace") && (selectedNodeId || selectedConnectionId)) {
      event.preventDefault();
      deleteSelection();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      setConnectionSourceId(null);
      setSelectedConnectionId(null);
      setTool("select");
    }
  }

  function testSystem() {
    const nextResult = evaluateConnectedSystem(nodes, connections, missionId);
    setResult(nextResult);
    setTimelineOpen(true);
    setSelectedConnectionId(null);
    if (nextResult.kind === "design-error") {
      const failingIndex = nextResult.failingNodeId
        ? nextResult.trace.findIndex((step) => step.nodeId === nextResult.failingNodeId)
        : -1;
      setCurrentStep(failingIndex);
      setRunStatus("failed");
      if (nextResult.failingNodeId) setSelectedNodeId(nextResult.failingNodeId);
      return;
    }
    setCurrentStep(0);
    setRunStatus("running");
  }

  function togglePause() {
    setRunStatus((current) => current === "running" ? "paused" : "running");
  }

  function stepForward() {
    if (!result || result.kind === "design-error") return;
    const lastVisibleStep = terminalIndex(result);
    if (currentStep >= lastVisibleStep) {
      setRunStatus(result.kind === "success" ? "success" : "failed");
      return;
    }
    const nextStep = currentStep + 1;
    setCurrentStep(nextStep);
    setRunStatus(nextStep >= lastVisibleStep ? (result.kind === "success" ? "success" : "failed") : "paused");
    if (nextStep >= lastVisibleStep && result.kind === "runtime-error" && result.failingNodeId) {
      setSelectedNodeId(result.failingNodeId);
    }
  }

  function handleCanvasDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const kind = event.dataTransfer.getData("application/x-under-the-hood-component") as BuilderComponentKind;
    if (!builderComponents.some((component) => component.kind === kind)) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    addNode(kind, {
      x: (event.clientX - bounds.left) / zoom - NODE_WIDTH / 2,
      y: (event.clientY - bounds.top) / zoom - NODE_HEIGHT / 2,
    });
  }

  function nodeState(node: CanvasNode): SystemNodeState {
    const traceIndex = result?.trace.findIndex((step) => step.nodeId === node.id) ?? -1;
    if (!result || runStatus === "idle") {
      if (!node.working) return "rejected";
      return node.id === selectedNodeId ? "inspected" : "default";
    }
    if (result.kind === "design-error") return node.id === result.failingNodeId ? "error" : "default";
    if (traceIndex < 0) return "disabled";
    if (runStatus === "success") return "success";
    if (runStatus === "failed") {
      if (traceIndex < currentStep) return "success";
      if (traceIndex === currentStep) return "error";
      return "disabled";
    }
    if (traceIndex < currentStep) return "success";
    if (traceIndex > currentStep) return "default";
    return runStatus === "paused" ? "paused" : "active";
  }

  function connectionState(connection: BuilderConnection) {
    const sourceIndex = result?.trace.findIndex((step) => step.nodeId === connection.sourceNodeId) ?? -1;
    const targetIndex = result?.trace.findIndex((step) => step.nodeId === connection.targetNodeId) ?? -1;
    if (!result || result.kind === "design-error" || sourceIndex < 0 || targetIndex < 0) return "default";
    if (runStatus === "success") return "complete";
    if (runStatus === "failed") {
      if (targetIndex === currentStep) return "error";
      return targetIndex < currentStep ? "complete" : "default";
    }
    if (targetIndex <= currentStep) return "complete";
    if (sourceIndex === currentStep) return runStatus === "paused" ? "paused" : "active";
    return "default";
  }

  const revealedResult = result && (result.kind === "design-error" || runStatus === "success" || runStatus === "failed") ? result : null;
  const failingNode = revealedResult?.failingNodeId
    ? nodes.find((node) => node.id === revealedResult.failingNodeId) ?? null
    : null;
  const failingDefinition = failingNode ? getBuilderComponent(failingNode.kind) : null;
  const activeTrace = result && currentStep >= 0 ? result.trace[currentStep] : null;
  const packetKind = runStatus === "success" || runStatus === "failed" ? "response" : "request";
  const traceNodes = result?.trace ?? inspection.path.map((node) => ({
    nodeId: node.id,
    kind: node.kind,
    title: getBuilderComponent(node.kind).name,
    detail: "Waiting for test",
    outcome: "waiting" as const,
  }));

  return (
    <div className="builder-shell builder-editor">
      <div className={`builder-workspace editor-workspace${libraryOpen ? "" : " builder-workspace-library-hidden"}${inspectorOpen ? "" : " builder-workspace-inspector-hidden"}`}>
        {libraryOpen ? <aside id="builder-library" className="builder-library editor-library" aria-labelledby="builder-library-title">
          <div className="builder-panel-heading">
            <button className="builder-panel-close" type="button" onClick={() => setLibraryOpen(false)} aria-label="Hide component library">×</button>
            <span>Build</span>
            <h2 id="builder-library-title">Components</h2>
            <p>Drag or click to add a software part.</p>
          </div>
          <label className="builder-library-search">
            <span aria-hidden="true">⌕</span>
            <span className="visually-hidden">Search components</span>
            <input value={componentSearch} onChange={(event) => setComponentSearch(event.target.value)} placeholder="Search components" />
          </label>
          <div className="builder-library-list">
            {filteredComponents.map((component) => (
              <button
                type="button"
                draggable
                key={component.kind}
                onDragStart={(event) => {
                  event.dataTransfer.setData("application/x-under-the-hood-component", component.kind);
                  event.dataTransfer.effectAllowed = "copy";
                }}
                onClick={() => addNode(component.kind)}
              >
                <span className={`builder-library-icon builder-icon-${component.kind}`}><NodeIcon kind={component.kind} /></span>
                <span><strong>{component.name}</strong><small>{component.shortName} · {component.purpose}</small></span>
                <b aria-hidden="true">＋</b>
              </button>
            ))}
          </div>
          {filteredComponents.length === 0 ? <p className="builder-library-empty">No components match that search.</p> : null}
          <div className="builder-templates">
            <span>Templates</span>
            <button type="button" onClick={() => loadTemplate("working")}><strong>Working flow</strong><small>Complete connected example</small></button>
            <button type="button" onClick={() => loadTemplate("broken")}><strong>Broken checkpoint</strong><small>Find and repair one failure</small></button>
            <button type="button" onClick={() => loadTemplate("blank")}><strong>Blank canvas</strong><small>Build the path yourself</small></button>
          </div>
        </aside> : null}

        <section className="builder-canvas-panel editor-canvas-panel" aria-label="System drawing canvas and execution trace">
          <div className="builder-canvas-topbar editor-canvas-toolbar">
            <div className="builder-canvas-tools" role="group" aria-label="Canvas tools">
              <button type="button" aria-expanded={libraryOpen} aria-controls="builder-library" onClick={toggleLibrary}><span aria-hidden="true">▥</span>Components</button>
              <button type="button" aria-expanded={inspectorOpen} aria-controls="builder-inspector" onClick={toggleInspector}><span aria-hidden="true">▤</span>Inspector</button>
              <button type="button" aria-expanded={timelineOpen} aria-controls="builder-timeline" onClick={() => setTimelineOpen((open) => !open)}><span aria-hidden="true">≡</span>Timeline</button>
              <i aria-hidden="true" />
              <button type="button" aria-pressed={tool === "select"} onClick={() => { setTool("select"); setConnectionSourceId(null); }}><span aria-hidden="true">↖</span>Select</button>
              <button type="button" aria-pressed={tool === "connect"} onClick={() => { setTool("connect"); setConnectionSourceId(null); }}><span aria-hidden="true">↗</span>Connect</button>
              <i aria-hidden="true" />
              <button type="button" onClick={autoArrange}><span aria-hidden="true">≋</span>Arrange</button>
              <button type="button" disabled={!selectedNodeId && !selectedConnectionId} onClick={deleteSelection}><span aria-hidden="true">⌫</span>Delete</button>
              <button type="button" onClick={clearCanvas}><span aria-hidden="true">□</span>Clear</button>
            </div>
            <div className={`builder-run-state builder-run-${runStatus}`} aria-live="polite"><i />{runLabels[runStatus]}</div>
            <div className="builder-playback" aria-label="Test playback controls">
              <button type="button" disabled={runStatus !== "running" && runStatus !== "paused"} onClick={togglePause}>{runStatus === "paused" ? "Resume" : "Pause"}</button>
              <button type="button" disabled={runStatus !== "paused"} onClick={stepForward}>Step</button>
              <button type="button" onClick={testSystem}>{runStatus === "idle" ? "Test" : "Replay"}</button>
            </div>
          </div>
          <div className="builder-activity editor-activity" aria-live="polite">
            <div>
              <span>{activeTrace ? `Current event · ${activeTrace.title}` : connectionSourceId ? "Connector started" : designIssues.length ? "Design check" : "Ready request"}</span>
              <strong>{activeTrace?.detail ?? (connectionSourceId ? "Choose the component that should receive this request next." : designIssues[0] ? designIssues[0].title : `${mission.method} ${mission.path} is ready to inspect.`)}</strong>
            </div>
            <Packet kind={packetKind} method={mission.method} path={mission.path} statusCode={result?.statusCode} state={runStatus === "running" ? "travelling" : runStatus === "paused" ? "paused" : runStatus === "success" ? "success" : runStatus === "failed" ? "error" : "idle"} compact />
          </div>

          {/* The canvas is a focusable region so the whole editor is reachable
              without a mouse: Tab in, arrows nudge, Delete removes, Esc cancels. */}
          <div
            className="builder-canvas-viewport"
            ref={canvasRef}
            role="application"
            aria-label="System canvas. Arrow keys move the selected component, Delete removes the selection, Escape cancels a connector."
            tabIndex={0}
            onKeyDown={handleCanvasKeyDown}
          >
            <div className={`builder-canvas-scale${nodes.length === 0 ? " builder-canvas-scale-empty" : ""}`} style={{ width: canvasSize.width * zoom, height: canvasSize.height * zoom }}>
              <div
                ref={surfaceRef}
                className={`builder-canvas editor-canvas builder-tool-${tool}${connectDrag ? " builder-canvas-connecting" : ""}`}
                aria-label={`System canvas with ${nodes.length} components and ${connections.length} connectors`}
                style={{ width: canvasSize.width, height: canvasSize.height, transform: `scale(${zoom})` }}
                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }}
                onDrop={handleCanvasDrop}
                onPointerDown={handleCanvasPointerDown}
                onPointerMove={handleCanvasPointerMove}
                onPointerUp={handleCanvasPointerUp}
                onPointerLeave={handleCanvasPointerUp}
                onClick={(event) => {
                  if (panState.current?.moved) return;
                  if (event.target === event.currentTarget) {
                    setSelectedNodeId(null);
                    setSelectedConnectionId(null);
                  }
                }}
              >
                <svg className="builder-connection-layer" viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`} aria-label="System connectors">
                  <defs>
                    <marker
                      id="builder-arrow-default"
                      markerUnits="userSpaceOnUse"
                      markerWidth="11"
                      markerHeight="11"
                      refX="10"
                      refY="5.5"
                      orient="auto"
                    >
                      <path className="builder-arrow-head" d="M0,0 L11,5.5 L0,11 Z" />
                    </marker>
                  </defs>
                  {connections.map((connection) => {
                    const source = nodes.find((node) => node.id === connection.sourceNodeId);
                    const target = nodes.find((node) => node.id === connection.targetNodeId);
                    if (!source || !target) return null;
                    const startX = source.x + NODE_WIDTH;
                    const startY = source.y + NODE_HEIGHT / 2;
                    const endX = target.x;
                    const endY = target.y + NODE_HEIGHT / 2;
                    const bend = Math.max(48, Math.abs(endX - startX) * 0.48);
                    const path = `M ${startX} ${startY} C ${startX + bend} ${startY}, ${endX - bend} ${endY}, ${endX} ${endY}`;
                    const state = connectionState(connection);
                    return (
                      <g key={connection.id} className={`builder-connection builder-connection-${state} ${selectedConnectionId === connection.id ? "builder-connection-selected" : ""}`}>
                        <path className="builder-connection-visible" d={path} markerEnd="url(#builder-arrow-default)" />
                        <path
                          className="builder-connection-hitbox"
                          d={path}
                          role="button"
                          tabIndex={0}
                          aria-label={`Connector from ${getBuilderComponent(source.kind).name} to ${getBuilderComponent(target.kind).name}`}
                          onClick={(event) => { event.stopPropagation(); setSelectedConnectionId(connection.id); setSelectedNodeId(null); }}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setSelectedConnectionId(connection.id);
                              setSelectedNodeId(null);
                            }
                          }}
                        />
                      </g>
                    );
                  })}
                  {connectDrag ? (() => {
                    const source = nodes.find((node) => node.id === connectDrag.sourceId);
                    if (!source) return null;
                    const startX = source.x + NODE_WIDTH;
                    const startY = source.y + NODE_HEIGHT / 2;
                    const bend = Math.max(40, Math.abs(connectDrag.x - startX) * 0.45);
                    return (
                      <path
                        className={`builder-connection-preview${connectDrag.overId ? " builder-connection-preview-valid" : ""}`}
                        d={`M ${startX} ${startY} C ${startX + bend} ${startY}, ${connectDrag.x - bend} ${connectDrag.y}, ${connectDrag.x} ${connectDrag.y}`}
                        markerEnd="url(#builder-arrow-default)"
                      />
                    );
                  })() : null}
                </svg>
                {nodes.map((node) => (
                  <div
                    className={`builder-node graph-node ${node.id === selectedNodeId ? "builder-node-selected" : ""} ${node.id === connectionSourceId ? "builder-node-connection-source" : ""} ${connectDrag && connectDrag.overId === node.id ? "builder-node-drop-target" : ""} ${connectDrag && connectDrag.sourceId !== node.id ? "builder-node-connectable" : ""}`}
                    key={node.id}
                    data-node-id={node.id}
                    style={{ left: node.x, top: node.y, width: NODE_WIDTH }}
                  >
                    <button
                      className="builder-node-select"
                      type="button"
                      data-node-id={node.id}
                      aria-pressed={node.id === selectedNodeId}
                      onClick={() => activateNode(node.id)}
                      onPointerDown={(event) => handleNodePointerDown(event, node)}
                      onPointerMove={handleNodePointerMove}
                      onPointerUp={handleNodePointerUp}
                      onPointerCancel={handleNodePointerUp}
                    >
                      <SystemNode kind={node.kind} label={getBuilderComponent(node.kind).name} detail={node.working ? getBuilderComponent(node.kind).workingLabel : getBuilderComponent(node.kind).brokenLabel} state={nodeState(node)} compact />
                    </button>
                    <button
                      className="builder-node-port"
                      type="button"
                      aria-label={`Drag from here to connect ${getBuilderComponent(node.kind).name} to another component`}
                      onPointerDown={(event) => startConnectDrag(event, node.id)}
                      onClick={() => startConnection(node.id)}
                    ><span aria-hidden="true">→</span></button>
                  </div>
                ))}
              </div>
              {nodes.length === 0 ? (
                <div className="builder-empty-state builder-empty-state-centered">
                  <span aria-hidden="true">＋</span>
                  <strong>Drop your first component</strong>
                  <p>Start with a Browser, then connect the responsibilities that should handle {mission.method} {mission.path}.</p>
                  <button type="button" onClick={() => addNode("browser")}>Add Browser</button>
                </div>
              ) : null}
            </div>
          </div>

          <div className="builder-canvas-statusbar">
            <span>{nodes.length} components · {connections.length} connectors</span>
            <strong>{tool === "connect" ? connectionSourceId ? "Select a target component" : "Select a starting component" : "Drag to move · drag empty space to pan · arrows nudge"}</strong>
            <div className="builder-status-actions">
            <details className="builder-key-help">
              <summary>Keys</summary>
              <ul>
                <li><kbd>V</kbd> select <kbd>C</kbd> connect</li>
                <li><kbd>T</kbd> test <kbd>A</kbd> arrange <kbd>F</kbd> fit</li>
                <li><kbd>←↑↓→</kbd> nudge · <kbd>Shift</kbd> further</li>
                <li><kbd>Delete</kbd> remove <kbd>Esc</kbd> cancel</li>
                <li><kbd>+</kbd><kbd>−</kbd> zoom <kbd>0</kbd> reset</li>
              </ul>
            </details>
            <div aria-label="Canvas zoom controls">
              <button type="button" aria-label="Zoom out" onClick={() => setZoom((value) => clamp(Number((value - 0.1).toFixed(1)), 0.3, 1.2))}>−</button>
              <button type="button" aria-label="Reset zoom" onClick={() => setZoom(0.9)}>{Math.round(zoom * 100)}%</button>
              <button type="button" onClick={fitToContent}>Fit</button>
              <button type="button" aria-label="Zoom in" onClick={() => setZoom((value) => clamp(Number((value + 0.1).toFixed(1)), 0.3, 1.2))}>＋</button>
            </div>
            </div>
          </div>
          {timelineOpen ? <ol id="builder-timeline" className="builder-trace editor-trace" aria-label="Request execution timeline">
            {traceNodes.map((traceStep, index) => {
              const traceState = runStatus === "idle" ? "waiting" : index < currentStep || runStatus === "success" ? "passed" : index === currentStep ? runStatus === "failed" || traceStep.outcome === "failed" ? "failed" : "current" : "waiting";
              const traceDetail = runStatus === "idle" || index > currentStep ? "Waiting for request" : traceStep.detail;
              return <li className={`builder-trace-${traceState}`} key={traceStep.nodeId}><span>{traceState === "passed" ? "✓" : traceState === "failed" ? "×" : index + 1}</span><div><strong>{traceStep.title}</strong><small>{traceDetail}</small></div></li>;
            })}
          </ol> : null}
        </section>

        {inspectorOpen ? <aside id="builder-inspector" className="builder-inspector editor-inspector" aria-label="Properties and test result">
          <div className="builder-panel-heading">
            <button className="builder-panel-close" type="button" onClick={() => setInspectorOpen(false)} aria-label="Hide inspector">×</button>
            <span>{revealedResult ? "Test evidence" : "Properties"}</span>
            <h2>{revealedResult ? "Test result" : selectedConnectionId ? "Connector" : "Component"}</h2>
            <p>Inspect one part without leaving the canvas.</p>
          </div>

          {revealedResult ? (
            <div className={`builder-result builder-result-${revealedResult.kind}`}>
              <StatusCode code={revealedResult.statusCode} />
              <div className="builder-result-copy">
                <span>{revealedResult.kind === "success" ? "What worked" : revealedResult.kind === "design-error" ? "Why it cannot run" : "Where it stopped"}</span>
                <h3>{revealedResult.title}</h3>
                <p>{revealedResult.reason}</p>
              </div>
              <div className="builder-repair-card">
                <span>{revealedResult.kind === "success" ? "Try next" : "Try this repair"}</span>
                <p>{revealedResult.fix}</p>
              </div>
              {revealedResult.kind === "runtime-error" && failingNode && failingDefinition ? (
                <div className="builder-setting builder-result-setting">
                  <strong>Repair {failingDefinition.name}</strong>
                  <p>Change the failed condition, then run the same request again.</p>
                  <div role="group" aria-label={`${failingDefinition.name} ${failingDefinition.setting}`}>
                    <button type="button" aria-pressed={failingNode.working} className={failingNode.working ? "builder-setting-active" : ""} onClick={() => updateNode(failingNode.id, { working: true })}><i aria-hidden="true">✓</i>{failingDefinition.workingLabel}</button>
                    <button type="button" aria-pressed={!failingNode.working} className={!failingNode.working ? "builder-setting-broken builder-setting-active" : "builder-setting-broken"} onClick={() => updateNode(failingNode.id, { working: false })}><i aria-hidden="true">×</i>{failingDefinition.brokenLabel}</button>
                  </div>
                </div>
              ) : null}
              {revealedResult.issues.length > 1 ? <details className="builder-more-issues"><summary>{revealedResult.issues.length - 1} more design {revealedResult.issues.length === 2 ? "issue" : "issues"}</summary><ul>{revealedResult.issues.slice(1).map((issue) => <li key={issue.id}>{issue.title}</li>)}</ul></details> : null}
              <button className="builder-edit-button" type="button" onClick={() => { setResult(null); setRunStatus("idle"); setCurrentStep(-1); }}>Return to editing</button>
            </div>
          ) : selectedConnectionId ? (
            <div className="builder-connection-inspector">
              <span className="builder-inspector-symbol" aria-hidden="true">↗</span>
              <h3>Request connector</h3>
              <p>A connector defines which component receives the request next. Its direction changes the execution order.</p>
              <button type="button" onClick={() => removeConnection(selectedConnectionId)}>Delete connector</button>
            </div>
          ) : selectedNode && selectedDefinition ? (
            <div className="builder-component-inspector">
              <div className={`builder-inspector-icon builder-icon-${selectedNode.kind}`}><NodeIcon kind={selectedNode.kind} /></div>
              <span>{selectedDefinition.shortName}</span>
              <h3>{selectedDefinition.name}</h3>
              <p>{selectedDefinition.purpose}</p>
              <div className="builder-setting">
                <strong>{selectedDefinition.setting}</strong>
                <p>Change one condition, predict the outcome, then test again.</p>
                <div role="group" aria-label={`${selectedDefinition.name} ${selectedDefinition.setting}`}>
                  <button type="button" aria-pressed={selectedNode.working} className={selectedNode.working ? "builder-setting-active" : ""} onClick={() => updateNode(selectedNode.id, { working: true })}><i aria-hidden="true">✓</i>{selectedDefinition.workingLabel}</button>
                  <button type="button" aria-pressed={!selectedNode.working} className={!selectedNode.working ? "builder-setting-broken builder-setting-active" : "builder-setting-broken"} onClick={() => updateNode(selectedNode.id, { working: false })}><i aria-hidden="true">×</i>{selectedDefinition.brokenLabel}</button>
                </div>
              </div>
              <div className="builder-position-tools">
                <strong>Position</strong>
                <div role="group" aria-label={`Move ${selectedDefinition.name} on canvas`}>
                  <button type="button" aria-label={`Move ${selectedDefinition.name} left`} onClick={() => nudgeSelected(-16, 0)}>←</button>
                  <button type="button" aria-label={`Move ${selectedDefinition.name} up`} onClick={() => nudgeSelected(0, -16)}>↑</button>
                  <button type="button" aria-label={`Move ${selectedDefinition.name} down`} onClick={() => nudgeSelected(0, 16)}>↓</button>
                  <button type="button" aria-label={`Move ${selectedDefinition.name} right`} onClick={() => nudgeSelected(16, 0)}>→</button>
                </div>
              </div>
              <div className="builder-inspector-actions">
                {connectionSourceId && connectionSourceId !== selectedNode.id ? <button type="button" onClick={() => connectNodes(connectionSourceId, selectedNode.id)}>Connect to {selectedDefinition.name}</button> : <button type="button" onClick={() => startConnection(selectedNode.id)}>Start connector here</button>}
                <button type="button" onClick={() => removeNode(selectedNode.id)}>Delete component</button>
              </div>
            </div>
          ) : (
            <div className="builder-inspector-empty"><span aria-hidden="true">⌕</span><strong>Nothing selected</strong><p>Select a component or connector to inspect and change it.</p></div>
          )}
          <p className="builder-model-note"><strong>Simplified learning model.</strong> Real systems can branch, retry, cache, and process work in parallel.</p>
        </aside> : null}
      </div>
    </div>
  );
}
