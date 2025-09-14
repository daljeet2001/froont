import React from "react";
import { getToken } from "../utils/auth";

export default function CreateRoom() {
  const [loading, setLoading] = React.useState(false);
  const [roomInfo, setRoomInfo] = React.useState(null);
  const [requireInvite, setRequireInvite] = React.useState(true);

  const createRoom = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch("http://localhost:4000/api/rooms", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          ...(token ? { Authorization: `Bearer ${token}` } : {}) 
        },
        body: JSON.stringify({ requireInviteToken: requireInvite })
      });
      const data = await res.json();
      setRoomInfo(data);
    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Create Room (Phase 2)</h2>

      <label className="flex items-center space-x-2 mb-4">
        <input 
          type="checkbox" 
          checked={requireInvite} 
          onChange={e => setRequireInvite(e.target.checked)} 
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        <span>Require invite token for solver</span>
      </label>

      <div>
        <button
          onClick={createRoom}
          disabled={loading}
          className={`px-4 py-2 rounded-lg font-medium text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>

      {roomInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md space-y-2">
          <p><span className="font-semibold">Room ID:</span> {roomInfo.roomId}</p>
          <p>
            <span className="font-semibold">Spectator link:</span>{" "}
            <a href={`${window.location.origin}/room/${roomInfo.roomId}`} className="text-blue-600 hover:underline">
              {window.location.origin}/room/{roomInfo.roomId}
            </a>
          </p>
          <p>
            <span className="font-semibold">Solver link:</span>{" "}
            <code className="bg-gray-200 px-1 py-0.5 rounded">
              {roomInfo.inviteToken 
                ? `${window.location.origin}/room/${roomInfo.roomId}?role=solver&invite=${roomInfo.inviteToken}`
                : `${window.location.origin}/room/${roomInfo.roomId}?role=solver`
              }
            </code>
          </p>
        </div>
      )}
    </div>
  );
}
