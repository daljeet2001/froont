import React from "react";
import Editor from "@monaco-editor/react";

export default function Replay({ roomId }) {
  const [events, setEvents] = React.useState([]);
  const [playing, setPlaying] = React.useState(false);
  const [code, setCode] = React.useState("// Replay will show here");
  const eventsRef = React.useRef([]);

  React.useEffect(() => {
    (async () => {
      const res = await fetch(`http://localhost:4000/api/replay/${roomId}`);
      const data = await res.json();
      setEvents(data.events || []);
      eventsRef.current = data.events || [];
    })();
  }, [roomId]);

  const startReplay = () => {
    if (!eventsRef.current.length) return;
    setPlaying(true);
    let i = 0;

    const step = () => {
      if (i >= eventsRef.current.length) {
        setPlaying(false);
        return;
      }
      const ev = eventsRef.current[i];
      setTimeout(() => {
        if (ev.type === "code_change") {
          setCode(ev.payload.code);
        }
        i++;
        step();
      }, i === 0 ? 0 : Math.max(10, (new Date(ev.createdAt).getTime() - new Date(eventsRef.current[i-1].createdAt).getTime())));
    };

    step();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="javascript"
          value={code}
          options={{ readOnly: true, minimap: { enabled: false }, fontSize: 14 }}
        />
      </div>

      <div className="w-80 border-l border-gray-200 p-4 bg-white flex flex-col">
        <h4 className="text-lg font-semibold mb-2">Replay — Room {roomId}</h4>
        <p className="mb-4 text-sm text-gray-600">Events: {events.length}</p>

        <button
          onClick={startReplay}
          disabled={playing || !events.length}
          className={`w-full py-2 rounded-lg font-medium text-white mb-4 ${
            playing || !events.length
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {playing ? "Playing..." : "Start Replay"}
        </button>

        <div className="flex-1 overflow-auto">
          <h5 className="font-semibold mb-2">Event List</h5>
          <ul className="space-y-1 text-sm text-gray-700">
            {events.map((ev, idx) => (
              <li key={idx}>
                <span className="text-gray-400">{new Date(ev.createdAt).toLocaleTimeString()}</span> — {ev.type}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
