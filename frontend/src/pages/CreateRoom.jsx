import React from "react";

export default function CreateRoom() {
  const [loading, setLoading] = React.useState(false);
  const [roomLink, setRoomLink] = React.useState(null);

  const createRoom = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/rooms", { method: "POST" });
      const data = await res.json();
      const link = `${window.location.origin}/room/${data.roomId}`;
      setRoomLink(link);
    } catch (err) {
      console.error(err);
      alert("Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>GreatFrontend Collab — Create Room (Phase 1)</h2>
      <button onClick={createRoom} disabled={loading}>
        {loading ? "Creating..." : "Create Room"}
      </button>

      {roomLink && (
        <div style={{ marginTop: 16 }}>
          <p>Invite (spectator):</p>
          <input value={roomLink} readOnly style={{ width: "100%" }} />
          <p style={{ marginTop: 8 }}>
            Solver link: <code>{roomLink + "?role=solver"}</code>
          </p>
          <div style={{ marginTop: 8 }}>
            <a href={roomLink}>Open spectator</a> ·{" "}
            <a href={roomLink + "?role=solver"}>Open solver</a>
          </div>
        </div>
      )}
    </div>
  );
}

