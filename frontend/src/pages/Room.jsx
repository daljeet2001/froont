import React from "react";
import SolverEditor from "../components/SolverEditor";
import SpectatorView from "../components/SpectatorView";

export default function Room({ roomId, role }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ flex: 1 }}>
        {role === "solver" ? <SolverEditor roomId={roomId} /> : <SpectatorView roomId={roomId} />}
      </div>

      <div style={{ width: 320, borderLeft: "1px solid #eee", padding: 12 }}>
        <h4>Room: {roomId}</h4>
        <p>Role: {role}</p>
        <p>Phase 1: basic spectator + solver</p>
      </div>
    </div>
  );
}

