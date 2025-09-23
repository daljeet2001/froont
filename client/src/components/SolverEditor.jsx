import React from "react";
import Editor from "@monaco-editor/react";

export default function SolverEditor({ roomId, token, inviteToken,qId }) {
  const wsRef = React.useRef(null);
  const [code, setCode] = React.useState("// Start coding...\n");
  const [lastSaved, setLastSaved] = React.useState(null);
  const [runResult, setRunResult] = React.useState(null);

  React.useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:4000");

    wsRef.current.onopen = () => {
      wsRef.current.send(
        JSON.stringify({
          type: "join_room",
          roomId,
          payload: { role: "solver" },
          token, // optional JWT
          inviteToken, // optional invite token (required if room enforces it)
        })
      );
    };

    wsRef.current.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === "update_code") {
          setCode(msg.payload.code);
        } else if (msg.type === "joined") {
          console.log("Joined room:", msg.roomId, "as", msg.role);
        } else if (msg.type === "run_output") {
          setRunResult(msg.payload);
        } else if (msg.type === "error") {
          console.error("WS error:", msg.message);
          alert(msg.message);
        }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };

    return () => {
      wsRef.current && wsRef.current.close();
    };
  }, [roomId, token, inviteToken]);

  const handleChange = (val) => {
    const newCode = val || "";
    setCode(newCode);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ type: "code_change", roomId, payload: { code: newCode } })
      );
    }
    setLastSaved(new Date().toISOString());
  };

  const runCode = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code,qId }),
      });
      const data = await res.json();
      console.log("Run result:", data);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({ type: "run_output", roomId, payload: { result: data } })
        );
      }
      setRunResult(data);
    } catch (err) {
      console.error(err);
      alert("Run failed");
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border rounded-lg shadow-md">
      {/* Editor */}
      <div className="flex-1 border-b">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          onChange={handleChange}
          options={{ fontSize: 14, minimap: { enabled: false } }}
        />
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-t bg-white text-sm">
        <button
          onClick={runCode}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Run (vm2)
        </button>

        <div className="text-gray-500">
          {lastSaved ? `Last change: ${new Date(lastSaved).toLocaleTimeString()}` : ""}
        </div>

        <div className="ml-auto text-gray-700 font-mono truncate max-w-xs">
          {runResult ? JSON.stringify(runResult).slice(0, 200) : ""}
        </div>
      </div>
    </div>
  );
}

