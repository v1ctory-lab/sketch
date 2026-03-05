import { Routes, Route,Navigate } from "react-router-dom";
import Login from "./Login";
import Profile from "./Profile";
import Workspace from "./Workspace";
import CanvasBoard from "./CanvasBoard";
import Chat from "./Chat";


export default function App() {
  return (
    

<Routes>
 
  <Route path="/" element={<Navigate to="/login" />} />
  <Route path="/login" element={<Login />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/chat" element={<Workspace />} />
  <Route path="/chat" element={<Chat />} />
  <Route path="/team/:teamId" element={<CanvasBoard />} />
</Routes>
  );
}