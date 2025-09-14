import React from "react";
import SolverEditor from "../components/SolverEditor";
import SpectatorView from "../components/SpectatorView";
import { getToken } from "../utils/auth";

export default function Room({ roomId, role }) {
  const token = getToken();
  const params = new URLSearchParams(window.location.search);
  const inviteToken = params.get("invite") || null;

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1">
        {role === "solver" ? (
          <SolverEditor roomId={roomId} token={token} inviteToken={inviteToken} />
        ) : (
          <SpectatorView roomId={roomId} token={token} />
        )}
      </div>

      <div className="w-80 border-l border-gray-200 p-4 bg-white flex flex-col space-y-2">
        <h4 className="text-lg font-semibold">Room: {roomId}</h4>
        <p><span className="font-medium">Role:</span> {role}</p>
        <p><span className="font-medium">Invite token:</span> {inviteToken ? inviteToken : "none"}</p>
        <p className="mt-4">
          <a href={`/replay/${roomId}`} className="text-blue-600 hover:underline">
            View replay
          </a>
        </p>
      </div>
    </div>
  );
}

