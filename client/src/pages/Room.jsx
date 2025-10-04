import React from "react";
import { useState, useEffect } from "react"
import SolverEditor from "../components/SolverEditor";
import SpectatorView from "../components/SpectatorView";
import { getToken } from "../utils/auth";
import useAntiCheat from "../hooks/useAntiCheat"

export default function Room({ roomId, role }) {
  const token = getToken();
  const params = new URLSearchParams(window.location.search);
  const inviteToken = params.get("invite") || null;
  const [questionDetails, setQuestionDetaiils] = useState(null);

  useEffect(() => {
    // Fetch room details to get questionId
    fetch(`http://localhost:4000/api/rooms/${roomId}`, {
    }).then(r => r.json()).then(async (roomData) => {
      if (roomData.questionSlug) {
        // Fetch question details using questionId
        const q = await fetch(`http://localhost:4000/api/questions/${roomData.questionSlug}`).then(r => r.json());
        setQuestionDetaiils(q);
      }
    })

  }, [])
  // useAntiCheat()

  return (
    <div className="flex h-screen bg-gray-100">

      <div className="w-80">
        {questionDetails ? (
          <div className="p-4 bg-white border-l border-gray-200 h-full overflow-y-auto">
            <h3 className="text-lg font-semibold mb-2">Question Details</h3>
            <h4 className="font-bold">{questionDetails.title}</h4>
            <p>{questionDetails.description}</p>
            <p>Examples:</p>
            <ul>
              {questionDetails.examples.map((example, index) => (
                <li key={index}>
                  <p>{example.input}</p>
                  <p>{example.output}</p>
                  <p>{example.explanation}</p>
                </li>
              ))}
            </ul>
            <p className="mb-2"><span className="font-medium">Difficulty:</span> {questionDetails.difficulty}</p>
            <p>Solved: {questionDetails.solved}</p>
            <p>Likes:{questionDetails.likes}</p>
          </div>
        ) : (
          <div className="p-4 bg-white border-l border-gray-200 h-full flex items-center justify-center">
            <p className="text-gray-500">Loading question details...</p>
          </div>
        )}
      </div>

      <div className="flex-1">
        {role === "solver" ? (
          <SolverEditor roomId={roomId} token={token} inviteToken={inviteToken} qId={questionDetails?._id} category={questionDetails?.category} starterCode={questionDetails?.starterCode}/>
        ) : (
          <SpectatorView roomId={roomId} token={token} category={questionDetails?.category} starterCode={questionDetails?.starterCode} />
        )}
      </div>

      {/* <div className="w-80 border-l border-gray-200 p-4 bg-white flex flex-col space-y-2">
        <h4 className="text-lg font-semibold">Room: {roomId}</h4>
        <p><span className="font-medium">Role:</span> {role}</p>
        <p><span className="font-medium">Invite token:</span> {inviteToken ? inviteToken : "none"}</p>
        <p className="mt-4">
          <a href={`/replay/${roomId}`} className="text-blue-600 hover:underline">
            View replay
          </a>
        </p>
      </div> */}

    </div>
  );
}

