// backend/server.js
import express from "express";
import http from "http";
import { WebSocketServer } from "ws";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import roomsRouter from "./routes/room.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/rooms", roomsRouter);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// In-memory simple mapping: roomId -> Set of sockets
const wsRooms = new Map();

wss.on("connection", (ws) => {
  ws.isAlive = true;

  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const { type, roomId, payload } = data;

      switch (type) {
        case "join_room": {
          ws.roomId = roomId;
          ws.role = payload?.role || "spectator";
          if (!wsRooms.has(roomId)) wsRooms.set(roomId, new Set());
          wsRooms.get(roomId).add(ws);
          // Optionally notify room about join
          break;
        }

        case "code_change": {
          const set = wsRooms.get(roomId) || new Set();
          for (const client of set) {
            if (client !== ws && client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "update_code", payload }));
            }
          }
          break;
        }

        case "run_code": {
          // Broadcast run results to room
          const runSet = wsRooms.get(roomId) || new Set();
          for (const client of runSet) {
            if (client.readyState === client.OPEN) {
              client.send(JSON.stringify({ type: "run_output", payload }));
            }
          }
          break;
        }

        default:
          console.warn("Unknown message type", type);
      }
    } catch (err) {
      console.error("WS message error", err);
    }
  });

  ws.on("close", () => {
    if (ws.roomId && wsRooms.has(ws.roomId)) {
      wsRooms.get(ws.roomId).delete(ws);
      if (wsRooms.get(ws.roomId).size === 0) wsRooms.delete(ws.roomId);
    }
  });
});

// Heartbeat to detect dead connections
setInterval(() => {
  for (const client of wss.clients) {
    if (client.isAlive === false) return client.terminate();
    client.isAlive = false;
    client.ping();
  }
}, 30000);

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`Server running on ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });

