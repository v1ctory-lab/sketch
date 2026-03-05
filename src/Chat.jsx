import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("chat-room")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.log(error);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();

    const { error } = await supabase.from("messages").insert([
      {
        content: newMessage,
        user_id: user.id,
        username: profile?.username || "User",
      },
    ]);

    if (error) {
      console.log(error);
    }

    setNewMessage("");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div style={page}>
      <div style={chatContainer}>

        <div style={header}>
          <h2 style={title}>Team Chat</h2>
          <button onClick={()=>navigate("/profile")}>
Profile
</button>
          <button onClick={handleLogout} style={logoutButton}>
            Logout
          </button>
        </div>

        <div style={chatBox}>
          {messages.map((msg) => (
            <div key={msg.id} style={messageRow}>
              <div style={messageBubble}>
                <strong>{msg.username || "User"}</strong>
                <br />
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div style={inputRow}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type message..."
            style={input}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button onClick={sendMessage} style={sendButton}>
            Send
          </button>
        </div>

      </div>
    </div>
  );
}

const page = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#f4f6fb",
};

const chatContainer = {
  width: "500px",
  background: "#ffffff",
  borderRadius: "15px",
  padding: "20px",
  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  display: "flex",
  flexDirection: "column",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};

const title = {
  margin: 0,
};

const logoutButton = {
  padding: "6px 12px",
  border: "none",
  background: "#ff4d4f",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer",
};

const chatBox = {
  height: "350px",
  overflowY: "auto",
  border: "1px solid #eee",
  borderRadius: "10px",
  padding: "10px",
  background: "#fafafa",
  marginBottom: "10px",
};

const messageRow = {
  display: "flex",
  justifyContent: "flex-start",
  marginBottom: "8px",
};

const messageBubble = {
  background: "#667eea",
  color: "white",
  padding: "8px 12px",
  borderRadius: "12px",
  maxWidth: "70%",
};

const inputRow = {
  display: "flex",
  gap: "10px",
};

const input = {
  flex: 1,
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
};

const sendButton = {
  padding: "10px 15px",
  border: "none",
  background: "#667eea",
  color: "white",
  borderRadius: "8px",
  cursor: "pointer",
};