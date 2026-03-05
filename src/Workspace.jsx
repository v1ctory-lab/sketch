import Chat from "./Chat";
import CanvasBoard from "./CanvasBoard";

export default function Workspace() {
  return (
    <div style={layout}>
      <div style={chatArea}>
        <Chat />
      </div>

      <div style={canvasArea}>
        <CanvasBoard />
      </div>
    </div>
  );
}

const layout = {
  display: "flex",
  height: "100vh",
};

const chatArea = {
  width: "320px",
  borderRight: "1px solid #ddd",
  background: "#fafafa",
};

const canvasArea = {
  flex: 1,
  background: "#fff",
};