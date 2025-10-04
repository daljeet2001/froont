import React from "react";
import Editor from "@monaco-editor/react";
import useAntiCheat from "../hooks/useAntiCheat"




export default function SolverEditor({ roomId, token, inviteToken, qId, category,starterCode }) {

  const wsRef = React.useRef(null);
  const [code, setCode] = React.useState(starterCode);
  const [socket,setSocket] = React.useState(null)

  const [lastSaved, setLastSaved] = React.useState(null);
  const [runResult, setRunResult] = React.useState(null);
  const [previewSrcDoc, setPreviewSrcDoc] = React.useState("");


  React.useEffect(()=>{
    setCode(starterCode)
  },[starterCode])

  React.useEffect(() => {
    wsRef.current = new WebSocket("ws://localhost:4000");


    wsRef.current.onopen = () => {
      wsRef.current.send(
        JSON.stringify({
          type: "join_room",
          roomId,
          payload: { role: "solver" },
          token,
          inviteToken,
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

    setSocket(wsRef.current);
 
  

    return () => {
      // wsRef.current && wsRef.current.close();
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

  // For JavaScript questions
  const runCode = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, qId }),
      });
      const data = await res.json();
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

  // For HTML / CSS questions
  const runPreview = () => {
    let srcDoc = "";
    if (category === "HTML") {
      srcDoc = `
        <html>
          <head></head>
          <body>
            ${code}
          </body>
        </html>
      `;
    } else if (category === "CSS") {
      srcDoc = `
        <html>
          <head>
            <style>${code}</style>
          </head>
          <body>
            <div class="test">Hello World</div>
          </body>
        </html>
      `;
    }
        else if (category === "react") {
      srcDoc =`
    <html>
      <head>
        <!-- Load React and ReactDOM -->
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <!-- Load Babel for JSX -->
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
      </head>
      <body>
        <div id="root"></div>
        
        <script type="text/babel">
          ${code}
          // If user defines a component called App, render it:
          ReactDOM.createRoot(document.getElementById("root"))
            .render(<App />);
        </script>
      </body>
    </html>
  `;
    }
 
    setPreviewSrcDoc(srcDoc);
  };

  useAntiCheat({wsRef,roomId,token,inviteToken});

 

  return (
    <div className="flex flex-col h-full bg-gray-50 border rounded-lg shadow-md">
      {/* Editor + Preview for HTML/CSS */}
      <div className="flex-1 border-b flex">
        <div className={category === "Javascript" ? "w-full" : "w-1/2 border-r"}>
          <Editor
            height="100%"
            defaultLanguage={
              category
                ? category === "Javascript"
                  ? "javascript"
                  : category.toLowerCase()
                : "html" 
            }
            value={code}
            onChange={handleChange}
            options={{ fontSize: 14, minimap: { enabled: false } }}
          />
        </div>

        {/* Live preview only for HTML/CSS */}
        {(category === "HTML" || category === "CSS" || category === "react") && (
          <div className="w-1/2 bg-white">
            <iframe
              srcDoc={previewSrcDoc}
              title="Preview"
              sandbox="allow-scripts"
              className="w-full h-full"
            />
          </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="flex items-center gap-4 px-4 py-2 border-t bg-white text-sm">
        {category === "Javascript" && (
          <button
            onClick={runCode}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Run (vm2)
          </button>
        )}

        {(category === "HTML" || category === "CSS" || category ==="react") && (
          <button
            onClick={runPreview}
            className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Preview
          </button>
        )}

        <div className="text-gray-500">
          {lastSaved ? `Last change: ${new Date(lastSaved).toLocaleTimeString()}` : ""}
        </div>

        {category === "Javascript" && (
          <div className="ml-auto text-gray-700 font-mono  ">
            {runResult ? JSON.stringify(runResult) : ""}
          </div>
        )}
      </div>
    </div>
  );
}
