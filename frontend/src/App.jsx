import React from "react";
import CreateRoom from "./pages/CreateRoom";
import Room from "./pages/Room";

export default function App() {
  const [route, setRoute] = React.useState(window.location.pathname + window.location.search);

  React.useEffect(() => {
    const onPop = () => setRoute(window.location.pathname + window.location.search);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (route.startsWith("/room/")) {
    const [path, query] = route.split("?");
    const roomId = path.replace("/room/", "");
    const params = new URLSearchParams(query || "");
    const role = params.get("role") || "spectator";
    return <Room roomId={roomId} role={role} />;
  }

  return <CreateRoom />;
}

