import React from "react";
import Editor from "@monaco-editor/react";

export default function SolverEditor({ roomId }) {
  const wsRef = React.useRef(null);
  const [code, setCode] = React.useState("// Start coding...\n");

  React.useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:4000");

    wsRef.current.onopen = () => {
      wsRef.current.send(JSON.stringify({ type: "join_room", roomId, payload: { role: "solver" } }));
    };

    wsRef.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "update_code") {
          // If the solver receives updates (e.g., from replay), update local view.
          setCode(msg.payload.code);
        } else if (msg.type === "run_output") {
          console.log("Run output", msg.payload);
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => {
      wsRef.current && wsRef.current.close();
    };
  }, [roomId]);

  const handleChange = (val) => {
    const newCode = val || "";
    setCode(newCode);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "code_change", roomId, payload: { code: newCode } }));
    }
  };

  return (
    <Editor height="100%"
      defaultLanguage="javascript"
      value={code}
      onChange={handleChange}
      options={{ fontSize: 14, minimap: { enabled: false } }}
    />
  );
}

