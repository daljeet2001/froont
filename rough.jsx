import React, { useEffect, useRef, useState } from "react";
import Editor from "@monaco-editor/react";

export default function SpectatorView({ roomId, token, category, starterCode }) {
    const wsRef = useRef(null);
    const videoRef = useRef(null);
    const pcRef = useRef(null);

    const [code, setCode] = useState(starterCode || "");
    const [previewSrcDoc, setPreviewSrcDoc] = useState(null);
    const [runResult, setRunResult] = useState(null);
    const [stream, setStream] = useState(null);

    // 🔹 Attach stream to <video> when available
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch((err) => console.warn("Autoplay failed:", err));
        }
    }, [stream]);

    useEffect(() => {
        setCode(starterCode);
    }, [starterCode])

    // 🔹 Initialize WebSocket + WebRTC
    useEffect(() => {
        const ws = new WebSocket("ws://localhost:4000");
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("✅ WS connected");
            ws.send(JSON.stringify({ type: "join_room", roomId, payload: { role: "spectator" }, token }));
            ws.send(JSON.stringify({ type: "receiver" }));
            startReceiving(ws);
        };

        ws.onmessage = async (event) => {
            const msg = JSON.parse(event.data);
            console.log("📩 Message:", msg);

            // --- Handle code updates ---
            if (msg.type === "update_code") setCode(msg.payload.code);
            if (msg.type === "run_output") setRunResult(msg.payload);
            if (msg.type === "cheating") alert(msg.payload.msg);

            // --- Handle WebRTC signaling ---
            if (msg.type === "createOffer" && msg.sdp) {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(msg.sdp));
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);
                ws.send(JSON.stringify({ type: "createAnswer", payload: { sdp: pcRef.current.localDescription } }));
            } else if (msg.type === "iceCandidate" && msg.candidate) {
                try {
                    await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
                } catch (err) {
                    console.error("Error adding ICE candidate:", err);
                }
            }
        };

        ws.onclose = () => console.log("❌ WS closed");
        ws.onerror = (err) => console.error("WS error:", err);

        return () => {
            ws.close();
            pcRef.current?.close();
        };
    }, [roomId, token]);

    // 🔹 WebRTC setup
    const startReceiving = (socket) => {
        pcRef.current = new RTCPeerConnection();

        pcRef.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.send(JSON.stringify({ type: "iceCandidate", payload: { candidate: event.candidate } }));
            }
        };

        pcRef.current.ontrack = (event) => {
            console.log("🎥 Remote track received");
            setStream(event.streams[0]);
        };
    };

    // 🔹 Join button manually starts video playback (if needed)
    const handleJoin = () => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
        }
    };

    // 🔹 Live preview generation
    useEffect(() => {
        if (category === "HTML") {
            setPreviewSrcDoc(`<html><body>${code}</body></html>`);
        } else if (category === "CSS") {
            setPreviewSrcDoc(`
        <html>
          <head><style>${code}</style></head>
          <body><div class="test">Hello World</div></body>
        </html>
      `);
        } else if (category === "react") {
            setPreviewSrcDoc(`
        <html>
          <head>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel">
              ${code}
              ReactDOM.createRoot(document.getElementById("root")).render(<App />);
            </script>
          </body>
        </html>
      `);
        }
    }, [code, category]);

    return (
        <div className="flex flex-col h-full bg-gray-50 border rounded-lg shadow-md">
            {/* Editor + Preview */}
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

            {/* JS Output */}
            {category === "Javascript" && runResult && (
                <div className="mt-2 p-2 bg-white border rounded shadow text-sm font-mono">
                    {JSON.stringify(runResult)}
                </div>
            )}

            {/* Video stream */}
            <div className="bg-gray-200 flex flex-col justify-center items-center gap-2 p-4">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-64 object-cover rounded-lg"
                />
                <button
                    onClick={handleJoin}
                    className="bg-black rounded-xl text-white w-24 h-10 mt-2 cursor-pointer hover:bg-gray-800"
                >
                    Join
                </button>
            </div>
        </div>
    );
}
