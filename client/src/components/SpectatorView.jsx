import React from "react";
import Editor from "@monaco-editor/react";
import { useState } from "react"

export default function SpectatorView({ roomId, token, category, starterCode }) {

  const wsRef = React.useRef(null);
  const [code, setCode] = React.useState(null);
  const [previewSrcDoc, setPreviewSrcDoc] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [message,setMessage] = useState(null)
  // console.log("category in spectator mode",category);
  // console.log("reviewSrcDoc", previewSrcDoc);
  console.log("message",message)

  React.useEffect(() => {
    setCode(starterCode)
  }, [starterCode])

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
        console.log("msg",msg)
        if (msg.type === "update_code") {
          console.log("code updated", msg.payload.code);
          setCode(msg.payload.code)
        }
        if (msg.type === "run_output") {
          console.log("Run output", msg.payload);
          setRunResult(msg.payload);
        }
        if(msg.type ==="cheating"){
          console.log("cheating messsage recieved",msg.payload)
          alert(msg.payload.msg);
          setMessage(msg.payload.msg);
        }
        // update preview live for HTML/CSS
        // if (category === "HTML") {

        //     console.log("code of html", msg.payload.code)
        //     setPreviewSrcDoc(`<html><head></head><body>${msg.payload.code}</body></html>`)

        // }

        //  else if (category === "CSS") {
        //   if (msg.type === "updated_code") {
        //     console.log("code for css", msg.payload.code);
        //     setPreviewSrcDoc(`
        //       <html>
        //         <head><style>${msg.payload.code}</style></head>
        //         <body><div class="test">Hello World</div></body>
        //       </html>
        //     `);

        //   }
        // }
      } catch (err) {
        console.error("WS parse error", err);
      }
    };




    return () => {
      wsRef.current && wsRef.current.close();
    };
  }, [roomId, token]);


  React.useEffect(() => {

    if (category === "HTML") {
      console.log("inside html if")
      setPreviewSrcDoc(`<html><head></head><body>${code}</body></html>`)
    }
    else if (category === "CSS") {
      setPreviewSrcDoc(`
              <html>
                <head><style>${code}</style></head>
                <body><div class="test">Hello World</div></body>
              </html>
            `);
    }
    else if (category === "react") {
      setPreviewSrcDoc(`
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
  `);
    }
  }, [code])

  return (
    <div className="flex flex-col h-full bg-gray-50 border rounded-lg shadow-md">
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

            options={{ readOnly: true, fontSize: 14, minimap: { enabled: false } }}
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
      {/* Optional run output display for Javascript */}
      {category === "Javascript" && runResult && (
        <div className="mt-2 p-2 bg-white border rounded shadow text-sm font-mono">
          {JSON.stringify(runResult)}
        </div>
      )}

 
    </div>
  );
}