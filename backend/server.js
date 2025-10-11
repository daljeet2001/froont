// backend/server.js
import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import roomsRouter from "./routes/room.js";
import questionsRouter from "./routes/questions.js";
import authRouter from "./routes/auth.js";
import replayRouter from "./routes/replay.js";
import jwt from "jsonwebtoken";
import SessionEvent from "./models/SessionEvent.js";
import Room from "./models/Room.js";
import { VM } from "vm2";
import Questions from "./models/Questions.js"
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/replay", replayRouter);
app.use("/api/questions", questionsRouter);



/**
 * Optional runner: WARNING: running user code is dangerous.
 * This runner uses vm2 with strict options; it's okay for simple JS snippets but NOT guaranteed sandbox on all environments.
 * For production use, run user code inside an isolated container (Docker) with strict resource limits.
 */


app.post("/api/run", async (req, res) => {
  try {
    const { code, qId } = req.body;
    // console.log("Code",code);
    if (typeof code !== "string") {
      return res.status(400).json({ error: "Missing code" });
    }

    const question = await Questions.findById(qId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const testCases = question.testCases;

    const vm = new VM({
      timeout: 2000,
      sandbox: {},
      eval: false,
      wasm: false
    });

    // Extract function name from user code
    const funcNameMatch = code.match(/function\s+([a-zA-Z0-9_]+)/);
    if (!funcNameMatch) {
      return res.json({ ok: false, error: "No function found in code" });
    }
    const funcName = funcNameMatch[1];

    // Load the student's code into the sandbox
    vm.run(code);

    // Run each test case
    const results = testCases.map(tc => {
      try {
        const args = Array.isArray(tc.input) ? tc.input : [tc.input];
        
        // Evaluate function call in same VM context
        const callCode = `${funcName}(${JSON.stringify(args)})`;
        const result = vm.run(callCode);
        console.log("result",result);
        const passed = JSON.stringify(result) === JSON.stringify(tc.expectedOutput);
        console.log("passed",passed)

        return { input: tc.input, expected: tc.expectedOutput, got: result,passed };
      } catch (err) {
        return { input: tc.input, expected: tc.expectedOutput, got: String(err), passed: false };
      }
    });

    return res.json({ ok: true, results });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Runner error" });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });


let senderSocket = null;
let recieverSocket = null;


// In-memory mapping roomId -> Set of sockets
const wsRooms = new Map();

wss.on("connection", (ws, req) => {
  ws.isAlive = true;
  ws.user = null;

  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      // console.log(`data on ws server ${data}`);
      const { type, roomId="null", payload="null", token="null", inviteToken="null" } = data;
      console.log(`type ${type} and payload ${payload}`);

      // Handle join_room: validate token or inviteToken if room requires it
      if (type === "join_room") {
        // check room config
        const room = await Room.findOne({ roomId }).lean();
        if (!room) {
          return ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
        }

        // If room requires inviteToken: accept join if client provided correct inviteToken OR has host/user JWT
        if (room.requireInviteToken) {
          // if inviteToken matches allow as solver
          if (payload?.role === "solver") {
            if (!inviteToken || inviteToken !== room.inviteToken) {
              return ws.send(JSON.stringify({ type: "error", message: "Invalid or missing invite token for solver role" }));
            }
          }
        }

        // If token (JWT) provided attach user
        if (token) {
          try {
            const decoded = jwt.verify(token, JWT_SECRET);
            ws.user = { userId: decoded.userId, email: decoded.email };
          } catch (e) {
            // token invalid — continue anonymous (but could restrict later)
            ws.user = null;
          }
        }

        ws.roomId = roomId;
        ws.role = payload?.role || "spectator";

        if (!wsRooms.has(roomId)) wsRooms.set(roomId, new Set());
        wsRooms.get(roomId).add(ws);

        // Save a join event for replay (optional)
        await SessionEvent.create({ roomId, type: "join", payload: { role: ws.role, user: ws.user?.email || null } });

        return ws.send(JSON.stringify({ type: "joined", roomId, role: ws.role }));
      }

      // All other messages expect ws.roomId to be set
      // if (!ws.roomId) return ws.send(JSON.stringify({ type: "error", message: "Not joined to a room" }));

      switch (type) {

        //webrtc part

        case "sender" : {
          senderSocket = ws;
          console.log("sender set");
          // console.log(`sender socket ${senderSocket}`);

        }

        case "reciever" : {
          recieverSocket = ws;
          console.log("reciever set");
          // console.log(`reciever socket ${recieverSocket}`);
        }

        case "createOffer" : {
          if(ws!= senderSocket) return;
          recieverSocket.send(JSON.stringify({type:"createOffer", payload:payload}))
        }

        case "createAnswer" : {
          if(ws!=recieverSocket)return;
          senderSocket.send(JSON.stringify({type : "createAnswer", payload: payload}))
        }

        case "iceCandidate" : {
          if(ws === recieverSocket){
            senderSocket.send(JSON.stringify({type:"iceCandidate", payload:payload}))
          }
          else if (ws === senderSocket){
            recieverSocket.send(JSON.stringify({type:"iceCandidate", payload:payload}))
          }
        }





        case "code_change": {
            if (!ws.roomId) return ws.send(JSON.stringify({ type: "error", message: "Not joined to a room" }));
          // persist event
          await SessionEvent.create({ roomId: ws.roomId, type: "code_change", payload });
          // broadcast to others
          const set = wsRooms.get(ws.roomId) || new Set();
          for (const client of set) {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "update_code", payload }));
            }
          }
          break;
        }

        case "cheating": {
          // broadcast to others
              if (!ws.roomId) return ws.send(JSON.stringify({ type: "error", message: "Not joined to a room" }));
          const set = wsRooms.get(ws.roomId) || new Set();
          for (const client of set) {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "cheating", payload }));
            }
          }
          break;
        }


        case "run_code": {
          // persist run request
              if (!ws.roomId) return ws.send(JSON.stringify({ type: "error", message: "Not joined to a room" }));
          await SessionEvent.create({ roomId: ws.roomId, type: "run_request", payload });
          // optionally run the code server-side (use /api/run instead)
          // broadcast run request to spectators
          const set = wsRooms.get(ws.roomId) || new Set();
          for (const client of set) {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "run_request", payload }));
            }
          }
          break;
        }

        case "run_output": {
              if (!ws.roomId) return ws.send(JSON.stringify({ type: "error", message: "Not joined to a room" }));
          // run output can be pushed back by runner and broadcast (persist)
          await SessionEvent.create({ roomId: ws.roomId, type: "run_output", payload });
          const set2 = wsRooms.get(ws.roomId) || new Set();
          for (const client of set2) {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "run_output", payload }));
            }
          }
          break;
        }

        case "cursor": {
          // optional: save cursor events for richer replay
              if (!ws.roomId) return ws.send(JSON.stringify({ type: "error", message: "Not joined to a room" }));
          await SessionEvent.create({ roomId: ws.roomId, type: "cursor", payload });
          const cursSet = wsRooms.get(ws.roomId) || new Set();
          for (const client of cursSet) {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "cursor", payload }));
            }
          }
          break;
        }

        default:
          console.warn("Unknown message type", type);
      }
    } catch (err) {
      console.error("WS message error", err);
      ws.send(JSON.stringify({ type: "error", message: "Server error parsing message" }));
    }
  });

  ws.on("close", () => {
    if (ws.roomId && wsRooms.has(ws.roomId)) {
      wsRooms.get(ws.roomId).delete(ws);
      if (wsRooms.get(ws.roomId).size === 0) wsRooms.delete(ws.roomId);
    }
  });
});

// Heartbeat
setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) return client.terminate();
    client.isAlive = false;
    client.ping();
  }
}, 30000);

const PORT = process.env.PORT || 4000;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });


