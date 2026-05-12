import { useEffect, useRef, type Dispatch } from "react";
import type { Action, SandboxState } from "./state.js";
import {
  rectCorners,
  projectShadow,
  worldToScreen,
  screenToWorld,
  type Rect,
  type SunPosition,
  type Point,
} from "@kolonitradgard/spatial-core";

interface Props {
  state: SandboxState;
  dispatch: Dispatch<Action>;
  sun: SunPosition;
  overlappingIds: Set<string>;
}

/**
 * Hit-test: is a world-point inside a rotated rectangle?
 * Transform point into the rect's local frame and check axis-aligned bounds.
 */
function pointInRect(p: Point, rect: Rect): boolean {
  const a = (-rect.rotationDeg * Math.PI) / 180;
  const cos = Math.cos(a);
  const sin = Math.sin(a);
  const dx = p.x - rect.cx;
  const dy = p.y - rect.cy;
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return Math.abs(lx) <= rect.width / 2 && Math.abs(ly) <= rect.height / 2;
}

export function Canvas({ state, dispatch, sun, overlappingIds }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ lastX: number; lastY: number; mode: "move" | "pan" } | null>(null);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = container.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext("2d")!;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background
    ctx.fillStyle = "#262626";
    ctx.fillRect(0, 0, w, h);

    // World grid every 1000 mm
    drawGrid(ctx, w, h, state.viewport);

    // Compass (N is -Y in our world)
    drawCompass(ctx, w, h);

    // Shadows first (behind)
    if (state.showShadows) {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      for (const rect of state.rectangles) {
        const poly = projectShadow(rect, sun);
        if (!poly) continue;
        ctx.beginPath();
        for (let i = 0; i < poly.length; i++) {
          const s = worldToScreen(poly[i]!, state.viewport);
          if (i === 0) ctx.moveTo(s.x, s.y);
          else ctx.lineTo(s.x, s.y);
        }
        ctx.closePath();
        ctx.fill();
      }
    }

    // Rectangles
    for (const rect of state.rectangles) {
      const corners = rectCorners(rect);
      const sc = corners.map((c) => worldToScreen(c, state.viewport));

      const isSelected = rect.id === state.selectedId;
      const isOverlap = overlappingIds.has(rect.id);
      const isWall = rect.wallHeight > 0;

      ctx.beginPath();
      for (let i = 0; i < sc.length; i++) {
        if (i === 0) ctx.moveTo(sc[i]!.x, sc[i]!.y);
        else ctx.lineTo(sc[i]!.x, sc[i]!.y);
      }
      ctx.closePath();

      ctx.fillStyle = isOverlap
        ? "rgba(255,80,80,0.35)"
        : isWall
          ? "rgba(150,120,80,0.55)"
          : "rgba(120,180,120,0.45)";
      ctx.fill();

      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.strokeStyle = isOverlap ? "#ff6464" : isSelected ? "#ffd166" : "#aaa";
      ctx.stroke();

      // Center marker
      const center = worldToScreen({ x: rect.cx, y: rect.cy }, state.viewport);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(center.x, center.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = "#ddd";
      ctx.font = "11px sans-serif";
      ctx.fillText(
        `${rect.id}  ${rect.width}×${rect.height}mm  ${rect.rotationDeg.toFixed(0)}°${
          isWall ? `  H=${rect.wallHeight}mm` : ""
        }`,
        center.x + 6,
        center.y - 6,
      );
    }
  }, [state, sun, overlappingIds]);

  // Pointer interactions
  const onPointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenP = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldP = screenToWorld(screenP, state.viewport);

    // Hit-test top-most first (last drawn = topmost)
    let hitId: string | null = null;
    for (let i = state.rectangles.length - 1; i >= 0; i--) {
      if (pointInRect(worldP, state.rectangles[i]!)) {
        hitId = state.rectangles[i]!.id;
        break;
      }
    }

    if (hitId) {
      dispatch({ type: "select", id: hitId });
      dragRef.current = { lastX: e.clientX, lastY: e.clientY, mode: "move" };
    } else {
      dispatch({ type: "select", id: null });
      dragRef.current = { lastX: e.clientX, lastY: e.clientY, mode: "pan" };
    }
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const dxPx = e.clientX - drag.lastX;
    const dyPx = e.clientY - drag.lastY;
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;

    if (drag.mode === "move") {
      // Convert pixel delta to world mm
      dispatch({
        type: "moveSelected",
        dx: dxPx / state.viewport.pixelsPerMm,
        dy: dyPx / state.viewport.pixelsPerMm,
      });
    } else {
      dispatch({
        type: "setViewport",
        viewport: {
          ...state.viewport,
          panX: state.viewport.panX + dxPx,
          panY: state.viewport.panY + dyPx,
        },
      });
    }
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const screenP = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldBefore = screenToWorld(screenP, state.viewport);

    const factor = Math.exp(-e.deltaY * 0.001);
    const newZoom = Math.max(0.005, Math.min(5, state.viewport.pixelsPerMm * factor));

    // Keep cursor's world point fixed under cursor
    const newPanX = screenP.x - worldBefore.x * newZoom;
    const newPanY = screenP.y - worldBefore.y * newZoom;

    dispatch({
      type: "setViewport",
      viewport: { panX: newPanX, panY: newPanY, pixelsPerMm: newZoom },
    });
  };

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        style={{ display: "block", touchAction: "none", cursor: "crosshair" }}
      />
    </div>
  );
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  vp: { panX: number; panY: number; pixelsPerMm: number },
) {
  const stepMm = 1000;
  const stepPx = stepMm * vp.pixelsPerMm;
  if (stepPx < 4) return; // too dense

  ctx.strokeStyle = "#333";
  ctx.lineWidth = 1;
  ctx.beginPath();

  const startX = vp.panX % stepPx;
  for (let x = startX; x < w; x += stepPx) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  const startY = vp.panY % stepPx;
  for (let y = startY; y < h; y += stepPx) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();
}

function drawCompass(ctx: CanvasRenderingContext2D, w: number, _h: number) {
  const cx = w - 50;
  const cy = 50;
  const r = 24;
  ctx.strokeStyle = "#888";
  ctx.fillStyle = "#888";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#ddd";
  ctx.fillText("N", cx - 4, cy - r + 12);
  ctx.fillText("S", cx - 4, cy + r - 4);
  ctx.fillText("E", cx + r - 10, cy + 4);
  ctx.fillText("W", cx - r + 2, cy + 4);
}
