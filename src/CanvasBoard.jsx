import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";

export default function CanvasBoard() {
  const canvasEl = useRef(null);
  const canvasRef = useRef(null);

  const [tool, setTool] = useState("select");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(4);

  const undoStack = useRef([]);
  const redoStack = useRef([]);

  /* ================= INIT ================= */
  useEffect(() => {
    if (!canvasEl.current) return;

    const canvas = new fabric.Canvas(canvasEl.current, {
      backgroundColor: "#ffffff",
      selection: true,
    });

    resizeCanvas(canvas);
    canvasRef.current = canvas;

    window.addEventListener("resize", () => resizeCanvas(canvas));

    enableZoom(canvas);
    enablePan(canvas);

    return () => canvas.dispose();
  }, []);

  /* ================= TOOL SWITCH ================= */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.isDrawingMode = false;
    canvas.selection = tool === "select";

    canvas.off("mouse:down");
    canvas.off("mouse:move");
    canvas.off("mouse:up");

    if (tool === "draw") enableDraw(canvas);
    if (tool === "erase") enableErase(canvas);
    if (["rect", "circle", "line"].includes(tool))
      enableShapes(canvas, tool);
  }, [tool, color, size]);

  /* ================= DRAW ================= */
  const enableDraw = (canvas) => {
    canvas.isDrawingMode = true;

    const brush = new fabric.PencilBrush(canvas);
    brush.color = color;
    brush.width = size;
    brush.decimate = 3;
    brush.strokeLineCap = "round";
    brush.strokeLineJoin = "round";

    canvas.freeDrawingBrush = brush;

    canvas.on("path:created", (e) => {
      undoStack.current.push(e.path);
      redoStack.current = [];
    });
  };

  /* ================= ERASE ================= */
  const enableErase = (canvas) => {
    let erasing = false;
    const radius = size * 1.2;

    const down = () => (erasing = true);
    const up = () => (erasing = false);

    const move = (opt) => {
      if (!erasing) return;

      const p = canvas.getPointer(opt.e);
      const objects = canvas.getObjects().slice().reverse();

      for (const obj of objects) {
        const box = obj.getBoundingRect(true);

        if (
          p.x >= box.left - radius &&
          p.x <= box.left + box.width + radius &&
          p.y >= box.top - radius &&
          p.y <= box.top + box.height + radius
        ) {
          canvas.remove(obj);
          undoStack.current.push(obj);
          break;
        }
      }
    };

    canvas.on("mouse:down", down);
    canvas.on("mouse:move", move);
    canvas.on("mouse:up", up);
  };

  /* ================= SHAPES ================= */
  const enableShapes = (canvas, shapeType) => {
    let shape, startX, startY;

    const down = (opt) => {
      const p = canvas.getPointer(opt.e);
      startX = p.x;
      startY = p.y;

      if (shapeType === "rect")
        shape = new fabric.Rect({
          left: startX,
          top: startY,
          fill: "transparent",
          stroke: color,
          strokeWidth: size,
        });

      if (shapeType === "circle")
        shape = new fabric.Ellipse({
          left: startX,
          top: startY,
          rx: 1,
          ry: 1,
          fill: "transparent",
          stroke: color,
          strokeWidth: size,
        });

      if (shapeType === "line")
        shape = new fabric.Line([startX, startY, startX, startY], {
          stroke: color,
          strokeWidth: size,
        });

      canvas.add(shape);
    };

    const move = (opt) => {
      if (!shape) return;
      const p = canvas.getPointer(opt.e);

      if (shapeType === "rect")
        shape.set({ width: p.x - startX, height: p.y - startY });

      if (shapeType === "circle")
        shape.set({
          rx: Math.abs(p.x - startX) / 2,
          ry: Math.abs(p.y - startY) / 2,
        });

      if (shapeType === "line")
        shape.set({ x2: p.x, y2: p.y });

      canvas.renderAll();
    };

    const up = () => {
      if (!shape) return;
      undoStack.current.push(shape);
      shape = null;
    };

    canvas.on("mouse:down", down);
    canvas.on("mouse:move", move);
    canvas.on("mouse:up", up);
  };

  /* ================= PAN ================= */
  const enablePan = (canvas) => {
    let isPanning = false;

    window.addEventListener("keydown", (e) => {
      if (e.code === "Space") canvas.defaultCursor = "grab";
    });

    canvas.on("mouse:down", (opt) => {
      if (opt.e.spaceKey) {
        isPanning = true;
        canvas.defaultCursor = "grabbing";
      }
    });

    canvas.on("mouse:move", (opt) => {
      if (isPanning) {
        const e = opt.e;
        canvas.relativePan({ x: e.movementX, y: e.movementY });
      }
    });

    canvas.on("mouse:up", () => {
      isPanning = false;
      canvas.defaultCursor = "default";
    });
  };

  /* ================= ZOOM ================= */
  const enableZoom = (canvas) => {
    canvas.on("mouse:wheel", (opt) => {
      const delta = opt.e.deltaY;
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** delta;

      zoom = Math.min(Math.max(0.2, zoom), 5);

      canvas.zoomToPoint(
        { x: opt.e.offsetX, y: opt.e.offsetY },
        zoom
      );

      opt.e.preventDefault();
      opt.e.stopPropagation();
    });
  };

  /* ================= RESIZE ================= */
  const resizeCanvas = (canvas) => {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;

    canvasEl.current.width = w * dpr;
    canvasEl.current.height = h * dpr;

    canvas.setWidth(w);
    canvas.setHeight(h);
    canvas.setZoom(dpr);
  };

  /* ================= DELETE KEY ================= */
  useEffect(() => {
    const handleDelete = (e) => {
      if (e.key === "Delete") {
        const canvas = canvasRef.current;
        const active = canvas.getActiveObject();
        if (active) {
          canvas.remove(active);
          undoStack.current.push(active);
        }
      }
    };
    window.addEventListener("keydown", handleDelete);
    return () => window.removeEventListener("keydown", handleDelete);
  }, []);

  return (
    <>
      <div style={toolbar}>
        <button onClick={() => setTool("select")}>V</button>
        <button onClick={() => setTool("draw")}>✏</button>
        <button onClick={() => setTool("erase")}>🧽</button>
        <button onClick={() => setTool("rect")}>▭</button>
        <button onClick={() => setTool("circle")}>◯</button>
        <button onClick={() => setTool("line")}>／</button>

        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <input type="range" min="1" max="40" value={size} onChange={(e) => setSize(+e.target.value)} />
      </div>

      <canvas ref={canvasEl} style={{ width: "100vw", height: "100vh" }} />
    </>
  );
}

const toolbar = {
  position: "fixed",
  top: 10,
  left: 10,
  background: "#fff",
  padding: 8,
  borderRadius: 8,
  display: "flex",
  gap: 6,
  zIndex: 100,
};