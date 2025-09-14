// backend/server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import roomsRouter from "./routes/room.js";
import authRouter from "./routes/auth.js";
import replayRouter from "./routes/replay.js";
import jwt from "jsonwebtoken";
import SessionEvent from "./models/SessionEvent.js";
import Room from "./models/Room.js";
import { VM } from "vm2";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/rooms", roomsRouter);
app.use("/api/replay", replayRouter);

/**
 * Optional runner: WARNING: running user code is dangerous.
 * This runner uses vm2 with strict options; it's okay for simple JS snippets but NOT guaranteed sandbox on all environments.
 * For production use, run user code inside an isolated container (Docker) with strict resource limits.
 */
app.post("/api/run", async (req, res) => {
  try {
    const { code } = req.body;
    if (typeof code !== "string") return res.status(400).json({ error: "Missing code" });

    // Very small VM with timeout and no require
    const vm = new VM({
      timeout: 2000, // 2s
      sandbox: {},
      eval: false,
      wasm: false
    });

    let output;
    try {
      output = vm.run(`(function(){\n${code}\n})();`);
      return res.json({ ok: true, result: output });
    } catch (err) {
      return res.json({ ok: false, error: String(err) });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Runner error" });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// In-memory mapping roomId -> Set of sockets
const wsRooms = new Map();

wss.on("connection", (ws, req) => {
  ws.isAlive = true;
  ws.user = null;

  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", async (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const { type, roomId, payload, token, inviteToken } = data;

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
      if (!ws.roomId) return ws.send(JSON.stringify({ type: "error", message: "Not joined to a room" }));

      switch (type) {
        case "code_change": {
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

        case "run_code": {
          // persist run request
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


