import { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        navigate("/chat");
      }
    });
  }, []);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      navigate("/chat");
    }
  };

  const handleSignup = async () => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  const user = data.user;

  if (user) {
    await supabase.from("profiles").insert([
      {
        id: user.id,
        username: email.split("@")[0], // default username
      },
    ]);
  }

  alert("Account created! Check your email to confirm.");
};
  return (
  <div style={container}>
    <div style={card}>
      <h2 style={title}>Team Whiteboard</h2>
      <p style={subtitle}>Collaborate with your team in real time</p>

      <input
        style={input}
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        style={input}
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button style={loginButton} onClick={handleLogin}>
        Login
      </button>

      <button style={signupButton} onClick={handleSignup}>
        Create Account
      </button>
    </div>
  </div>
);
}

const container = {
  height: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "linear-gradient(135deg, #667eea, #764ba2)",
};

const card = {
  background: "#ffffff",
  padding: "40px",
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  width: "350px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
  textAlign: "center",
};

const title = {
  margin: 0,
  fontSize: "24px",
  fontWeight: "600",
};

const subtitle = {
  margin: 0,
  fontSize: "14px",
  color: "#666",
  marginBottom: "10px",
};

const input = {
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "14px",
  outline: "none",
  transition: "0.3s",
};

const loginButton = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#667eea",
  color: "#fff",
  fontWeight: "600",
  cursor: "pointer",
  transition: "0.3s",
};

const signupButton = {
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#eee",
  color: "#333",
  fontWeight: "500",
  cursor: "pointer",
  transition: "0.3s",
};