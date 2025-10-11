import React, { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import {useParams} from "react-router-dom"

export default function QuestionDetail() {
  const { slug } = useParams();
  const [q, setQ] = useState(null);
  const [creating, setCreating] = useState(false);
  const [roomInfo, setRoomInfo] = React.useState(null);
  const [requireInvite, setRequireInvite] = React.useState(true);
  const [solverLink, setSolverLink] = React.useState(null);
  const [spectatorLink, setSpectatorLink] = React.useState(null);

  useEffect(() => {
    fetch(`http://localhost:4000/api/questions/${slug}`).then(r=>r.json()).then(setQ).catch(console.error);
  }, [slug]);

  const createRoom = async () => {
    try {
      setCreating(true);
      const token = getToken();
      const res = await fetch("http://localhost:4000/api/rooms", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify({ requireInviteToken: requireInvite , questionSlug: slug})
      });
      const data = await res.json();
      setRoomInfo(data);
    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  React.useEffect(()=>{
    if(roomInfo){
       const slink = roomInfo.inviteToken 
                ? `${window.location.origin}/room/${roomInfo.roomId}?role=solver&invite=${roomInfo.inviteToken}`
                : `${window.location.origin}/room/${roomInfo.roomId}?role=solver`
      setSolverLink(slink);


      const ilink = `${window.location.origin}/room/${roomInfo.roomId}`
      setSpectatorLink(ilink);
    }


  },[roomInfo])

  if (!q) return <div>Loading...</div>;


  const handleCopy = async(link)=>{
    try{
      console.log(`link in handleCopy ${link}`)
      await navigator.clipboard.writeText(link);
      alert("Link copied to the clipboard")

    }catch(e){
     console.log(`failed to copy the link,${err}`);
     alert("failed to copy the link")
    }

  }
  return (
    <>
    <div style={{ padding: 20 }}>
      <p><b>Author:</b> {q.author}</p>
      <h2><b>Title:</b>{q.title}</h2>
      <p><b>Description:</b>{q.description}</p>
      <p><b>Examples:</b>
      <ul>
          {q.examples.map((ex, index) => (
            <li key={index} className="mb-2">
              <p><b>Input:</b> {ex.input}</p>
              <p><b>Output:</b> {ex.output}</p>
              {ex.explannation && <p><b>Explanation:</b> {ex.explannation}</p>}
            </li>
          ))} 
        </ul>
        </p>
      <p><b>Difficulty:</b> {q.difficulty}</p>
      <p><b>Category:</b>{q.category}</p>
      <p><b>Solved:</b>{q.solved}</p>
      <p><b>Likes:</b>{q.likes}</p>

      <div style={{ marginTop: 12 }}>
      <label className="flex items-center space-x-2 mb-4">
        <input 
          type="checkbox" 
          checked={requireInvite} 
          onChange={e => setRequireInvite(e.target.checked)} 
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <span>Require invite token for solver</span>
      </label>
        <button className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer" onClick={createRoom} disabled={creating}>{creating ? "Creating..." : "Start Interview with this question"}</button>
      </div>
      <div style={{ marginTop: 20 }}>
        <a className="bg-blue-500 text-white px-4 py-2 rounded cursor-pointer" href="/questions">Back to list</a>
      </div>
    </div>

      {roomInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md space-y-2">
          <p><span className="font-semibold">Room ID:</span> {roomInfo.roomId}</p>
          {/* <p>
            <span className="font-semibold">Spectator link:</span>{" "}
            <a href={`${window.location.origin}/room/${roomInfo.roomId}`} className="text-blue-600 hover:underline">
              {window.location.origin}/room/{roomInfo.roomId}
            </a>
          </p> */}
          <p>
            {/* <span className="font-semibold">Solver link:</span>{" "} */}
            
            {/* <code className="bg-gray-200 px-1 py-0.5 rounded">
             {roomInfo.inviteToken 
                ? `${window.location.origin}/room/${roomInfo.roomId}?role=solver&invite=${roomInfo.inviteToken}`
                : `${window.location.origin}/room/${roomInfo.roomId}?role=solver`
              }
            </code> */}


               { spectatorLink &&
            <button  className="p-4 bg-blue-500 text-white cursor-pointer mr-4" onClick={()=>handleCopy(spectatorLink)}>copy spectator link</button>
            }

      { solverLink &&
            <button  className="p-4 bg-blue-500 text-white cursor-pointer" onClick={()=>handleCopy(solverLink)}>copy solver link</button>
            }
          </p>
        </div>
      )}
 
    </>
  );
}

