import { useEffect, useState } from "react";

export default function useAntiCheat({ wsRef, roomId, token, inviteToken }) {
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) return;

    if (ws.readyState === WebSocket.OPEN) {
      setIsReady(true);
    } else {
      const handleOpen = () => setIsReady(true);
      ws.addEventListener("open", handleOpen);
      return () => ws.removeEventListener("open", handleOpen);
    }
  }, [wsRef]);

  // Attach anti-cheat logic once WebSocket is ready
  useEffect(() => {
    if (!roomId || !isReady) return;
    const ws = wsRef.current;
    if (!ws) return;

    console.log("🟢 AntiCheat active for room:", roomId);

    const sendCheatAlert = (reason) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: "cheating",
            roomId,
            payload: { msg: reason },
            token,
            inviteToken,
          })
        );
        console.log("🚨 cheating message sent:", reason);
      } else {
        console.warn("⚠️ Cannot send cheating message, WS not open");
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        sendCheatAlert("The user switched to another tab.");
        alert("Please stay on your tab! Or you will be disqualified.");
      }
    };

    const handleBlur = () => {
      sendCheatAlert("The user switched to another tab.");
      alert("Please stay on your tab! Or you will be disqualified.");
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
    };
  }, [roomId, isReady]);
}
