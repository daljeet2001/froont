import React from "react";
import Editor from "@monaco-editor/react";
import useAntiCheat from "../hooks/useAntiCheat"




export default function SolverEditor({ roomId, token, inviteToken, qId, category, starterCode }) {

  const wsRef = React.useRef(null);
  const [code, setCode] = React.useState(starterCode);
  const [socket, setSocket] = React.useState(null)
  const pcRef = React.useRef(null);
  const [stream, setStream] = React.useState(null);
  const videoRef = React.useRef(null);
  // console.log("stream in solver",stream);


  const [lastSaved, setLastSaved] = React.useState(null);
  const [runResult, setRunResult] = React.useState(null);
  const [previewSrcDoc, setPreviewSrcDoc] = React.useState("");


  React.useEffect(() => {
    setCode(starterCode)
  }, [starterCode])

  React.useEffect(() => {
    if (videoRef.current && stream) {

      console.log(`stream ${stream}`);
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((err) => console.warn("Autoplay failed:", err));
    }
  }, [stream]);

  React.useEffect(() => {

    //ws starter code
    wsRef.current = new WebSocket("ws://localhost:4000");

    //webrtc starter code
    const pc = new RTCPeerConnection();
    pcRef.current = pc


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

      wsRef.current.send(
        JSON.stringify({
          type: "sender"
        })
      );

      if (wsRef.current && pc) startReceiving(wsRef.current, pc);
    };




    wsRef.current.onmessage = (e) => {
      try {
        // const msg = typeof(e.data) === "string" ? JSON.parse(e.data) :e.data;
        const msg = JSON.parse(e.data);
        console.log(`msg in solver`, msg)
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
        else if (msg.type === "createAnswer") {
          const peer = pcRef.current;
          if (!peer) return console.error('peer connectionm not ready')
          peer.setRemoteDescription({
            type: msg.payload.type,
            sdp: msg.payload.sdp
          });
          // peer.setRemoteDescription(msg.payload.sdp)
          console.log("Answer recieved by solverEditor")
        }

        else if (msg.type === "iceCandidate") {
          const peer = pcRef.current;
          if (!peer) return console.error("peer connectio not ready")
          peer.addIceCandidate(msg.payload);
          // peer.addIceCandidate(msg.payload.candidate);
          console.log(`iceCandides of SpectatorView added by SOlverEditor pc`)

        }
      } catch (err) {

        console.error("WS parse error", err);
      }
    };





    setSocket(wsRef.current);

    //webrtc starter code


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
      srcDoc = `
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
  //anticheat hook
  // useAntiCheat({wsRef,roomId,token,inviteToken});



  //webrtc part


  const startReceiving = (socket, pc) => {
    pc.ontrack = (event) => {
      console.log("Track received:", event);
      setStream(event.streams[0]); 
    };
  };

  async function startSendingVideo() {
    if (!socket) return console.error('socket connection not ready')
    const peer = pcRef.current;
    if (!peer) console.error('peer connection not ready');

    peer.onnegotiationneeded = async () => {
      console.log("negotiation started")
      const offer = await peer.createOffer()
      await peer.setLocalDescription(offer)
      socket?.send(JSON.stringify({
        type: "createOffer",
        payload: {
          type: offer.type,
          sdp: offer.sdp
        }
      }))
      console.log("offer made from solverEdiotr")
    }

    peer.onicecandidate = (event) => {
      console.log(event)
      if (event.candidate) {
        socket?.send(JSON.stringify({ type: "iceCandidate", payload: event.candidate }))
        console.log(`ice candidares of SolverEdiotr sent`)
      }
    }

    // const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    // pc.addTrack(stream.getVideoTracks()[0])
    getCameraStreamAndSend(peer)

  }

  const getCameraStreamAndSend = (pc) => {
    navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
      stream.getTracks().forEach((track) => {
        pc?.addTrack(track, stream);
      });
    });


  }


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

        {(category === "HTML" || category === "CSS" || category === "react") && (
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


      {/* webrtc video call */}

      {/* webrtc video call */}


      {/* button to send ot video to another person */}
      <button
        className="rounded-xl bg-black text-white w-24 h-10 cursor-pointer mt-2"
        onClick={startSendingVideo}
      >
        Call
      </button>
      {/* div to play video of another person*/}

      <div className="bg-gray-300 flex flex-col justify-center items-center gap-2">

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />
      </div>

    </div>
  );
}



