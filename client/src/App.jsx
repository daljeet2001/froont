import { Routes, Route, Navigate } from "react-router-dom";
// import CreateRoom from "./pages/CreateRoom";
import Room from "./pages/Room";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Replay from "./pages/Replay";
import LandingPage from "./pages/LandingPage";
import QuestionsList from "./pages/QuestionsList";
import QuestionDetail from "./pages/QuestionDetail";
import { ProtectedRoute } from "./components/Protected";

export default function App() {
  return (

      <Routes>

        {/* Landing route */}
        <Route path="/" element={<LandingPage/>} />

        <Route element={<ProtectedRoute />}>
        {/* Home route */}
        {/* <Route path="/home" element={<CreateRoom />} /> */}
        <Route path="/questions" element={<QuestionsList/>}/>
        <Route path="/question/:slug" element={<QuestionDetail/>}/>

            {/* Dynamic room route */}
        <Route
          path="/room/:roomId"
          element={<RoomWrapper />}
        />


        {/* Replay route */}
        <Route
          path="/replay/:roomId"
          element={<ReplayWrapper />}
        />

        </Route>


     

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

    


        {/* Catch-all → redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
}

/* -------- Wrappers to handle URL params ---------- */
import { useParams, useSearchParams } from "react-router-dom";

function RoomWrapper() {
  const { roomId } = useParams();
  const [params] = useSearchParams();
  const role = params.get("role") || "spectator";

  return <Room roomId={roomId} role={role} />;
}
// function QuestionDetailWrapper(){
//   const = { slug } = useParams();
//   return <QuestionDetail slug={slug}/>;
// }

function ReplayWrapper() {
  const { roomId } = useParams();
  return <Replay roomId={roomId} />;
}

