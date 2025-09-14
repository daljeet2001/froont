import React from "react";
import Editor from "@monaco-editor/react";

export default function SpectatorView({ roomId, token }) {
  const wsRef = React.useRef(null);
  const [code, setCode] = React.useState("// Waiting for solver...");

  React.useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:4000");

    wsRef.current.onopen = () => {
      wsRef.current.send(
        JSON.stringify({ type: "join_room", roomId, payload: { role: "spectator" }, token })
      );
    };

    wsRef.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "update_code") setCode(msg.payload.code);
        if (msg.type === "run_output") console.log("Run output", msg.payload);
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => {
      wsRef.current && wsRef.current.close();
    };
  }, [roomId, token]);

  return (
    <div className="w-full h-screen bg-gray-100 p-4">
      <div className="w-full h-full border rounded-lg shadow-md overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
        />
      </div>
    </div>
  );
}
