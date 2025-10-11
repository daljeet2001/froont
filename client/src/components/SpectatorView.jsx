import React from "react";
import Editor from "@monaco-editor/react";
import { useState, useRef } from "react"

export default function SpectatorView({ roomId, token, category, starterCode }) {

  const wsRef = React.useRef(null);
  const videoRef = React.useRef(null);
  const [code, setCode] = React.useState(null);
  const [previewSrcDoc, setPreviewSrcDoc] = useState(null);
  const [runResult, setRunResult] = useState(null);
  const [message, setMessage] = useState(null);
  const [socket, setSocket] = useState(null);

  const [stream, setStream] = useState(null);
  const pcRef = useRef(null);


  // console.log("category in spectator mode",category);
  // console.log("reviewSrcDoc", previewSrcDoc);
  // console.log("message", message)

  // console.log(`stream in SpectatorView`, SpectatorView)

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
    wsRef.current.onopen = () => {
      setSocket(wsRef.current);
      wsRef.current.send(
        JSON.stringify({ type: "join_room", roomId, payload: { role: "spectator" }, token })
      );
      wsRef.current.send(JSON.stringify({ type: "reciever" }));

      //pc starter code

      const pc = new RTCPeerConnection();
      pcRef.current = pc;

      if (wsRef.current && pc) startReceiving(wsRef.current, pc);
    };



    wsRef.current.onmessage = async (e) => {
      try {
        const pc = pcRef.current;
        if (!pc) return console.error(`peer connection not ready`);

        // const msg = typof(e.data) === "string" ? JSON.parse(e.data) : e.data
        const msg = JSON.parse(e.data);
        console.log("msg", msg)
        if (msg.type === "update_code") {
          console.log("code updated", msg.payload.code);
          setCode(msg.payload.code)
        }
        if (msg.type === "run_output") {
          console.log("Run output", msg.payload);
          setRunResult(msg.payload);
        }
        if (msg.type === "cheating") {
          console.log("cheating messsage recieved", msg.payload)
          alert(msg.payload.msg);
          setMessage(msg.payload.msg);
        }

        if (msg.type === 'createOffer') {
          console.log(`offer gotten by spectatorView`, msg)

          // adding specttaor video feed before making an answer
          await navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
            stream.getTracks().forEach((track) => {
              pc?.addTrack(track, stream);
            });
          });
          await pc.setRemoteDescription({
            type: msg.payload.type,
            sdp: msg.payload.sdp
          });
          //  await pc.setRemoteDescription(msg.payload.sdp);



          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          wsRef.current.send(JSON.stringify({
            type: "createAnswer",
            payload: {
              type: answer.type,
              sdp: answer.sdp
            }
          }));
          console.log('answer sent from specatatorView')
        }

        if (msg.type === "iceCandidate" && msg.payload) {
          // await pc.addIceCandidate();
          await pc.addIceCandidate(msg.payload);
          console.log(`ice candidtes of solverEditr added by spectatorEdiotr`)
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



  const startReceiving = (socket, pc) => {

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.send(JSON.stringify({ type: "iceCandidate", payload: event.candidate }));
        console.log(`ice candidates of spectatorView sent`)
      }
    };

    pc.ontrack = (event) => {
      console.log("Track received:", event);
      setStream(event.streams[0]); // ✅ Save stream for later
    };

  };


  // async function startSendingVideo() {
  //   if (!socket) return console.error('socket connection not ready')
  //   const peer = pcRef.current;
  //   if (!peer) console.error('peer connection not ready');

  //   // peer.onnegotiationneeded = async () => {
  //   //   console.log("negotiation started")
  //   //   const offer = await peer.createOffer()
  //   //   await peer.setLocalDescription(offer)
  //   //   socket?.send(JSON.stringify({
  //   //     type: "createOffer",
  //   //     payload: {
  //   //       type: offer.type,
  //   //       sdp: offer.sdp
  //   //     }
  //   //   }))
  //   //   console.log("offer made from solverEdiotr")
  //   // }

  //   // peer.onicecandidate = (event) => {
  //   //   console.log(event)
  //   //   if (event.candidate) {
  //   //     socket?.send(JSON.stringify({ type: "iceCandidate", payload: event.candidate }))
  //   //     console.log(`ice candidares of SolverEdiotr sent`)
  //   //   }
  //   // }

  //   getCameraStreamAndSend(peer)

  // }

  // const getCameraStreamAndSend = (pc) => {
  //   navigator.mediaDevices.getUserMedia({ video: true, audio: false }).then((stream) => {
  //     stream.getTracks().forEach((track) => {
  //       pc?.addTrack(track, stream);
  //     });
  //     console.log("vidfeo sent from spectator")
  //   });


  // }






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
      {/*  video call */}

      {/* button to send ot video to another person */}

      {/* <button
        className="rounded-xl bg-black text-white w-24 h-10 cursor-pointer mt-2"
        onClick={startSendingVideo}
      >
        Call
      </button> */}
      {/* div to play video of another person*/}

      <div className="bg-gray-300 flex flex-col justify-center items-center gap-2">

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg"
        />

        {/* <button onClick={handlePlay} className="bg-black rounded-xl text-white w-24 h-10 mt-2 cursor-pointer" >Join</button> */}
      </div>


    </div>
  );
}


