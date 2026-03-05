import { useEffect, useState } from "react";
import { supabase } from "./supabase";

export default function Profile() {

  const [user,setUser] = useState(null);
  const [username,setUsername] = useState("");
  const [loading,setLoading] = useState(false);

  useEffect(()=>{
    getProfile()
  },[])

  const getProfile = async () => {

    const { data:{user} } = await supabase.auth.getUser()

    setUser(user)

    const { data } = await supabase
      .from("profiles")
      .select("username")
      .eq("id",user.id)
      .single()

    if(data){
      setUsername(data.username)
    }

  }

  const updateProfile = async () => {

    setLoading(true)

    const { data:{user} } = await supabase.auth.getUser()

    await supabase
      .from("profiles")
      .upsert({
        id:user.id,
        username:username
      })

    alert("Profile updated!")

    setLoading(false)
  }

  return (

    <div style={container}>

      <div style={card}>

        <h2>Profile</h2>

        <p>Email: {user?.email}</p>

        <input
          value={username}
          onChange={(e)=>setUsername(e.target.value)}
          placeholder="Username"
          style={input}
        />

        <button onClick={updateProfile} style={button}>
          {loading ? "Saving..." : "Save"}
        </button>

      </div>

    </div>
  )
}

const container = {
  height:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#f4f6fb"
}

const card = {
  background:"white",
  padding:"30px",
  borderRadius:"12px",
  width:"350px",
  display:"flex",
  flexDirection:"column",
  gap:"10px",
  boxShadow:"0 10px 20px rgba(0,0,0,0.1)"
}

const input = {
  padding:"10px",
  borderRadius:"8px",
  border:"1px solid #ddd"
}

const button = {
  padding:"10px",
  border:"none",
  background:"#667eea",
  color:"white",
  borderRadius:"8px",
  cursor:"pointer"
}