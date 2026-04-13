const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const http = require("http");
const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "UNICORN_FINAL_SECRET";

const OWNER = {
  username: "admin",
  password: "123456"
};

let vps = [];

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username !== OWNER.username || password !== OWNER.password) {
    return res.status(403).json({ error: "Access denied" });
  }

  const token = jwt.sign({ role: "owner" }, SECRET, {
    expiresIn: "12h"
  });

  res.json({ token });
});

function auth(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = jwt.verify(token, SECRET);

    if (data.role !== "owner") throw new Error();

    next();
  } catch {
    res.status(403).json({ error: "Unauthorized" });
  }
}

app.post("/vps/create", auth, (req, res) => {
  const server = {
    id: uuidv4(),
    name: req.body.name || "server",
    status: "running"
  };

  vps.push(server);

  broadcast({ type: "vps_created", data: server });

  res.json(server);
});

app.get("/vps", auth, (req, res) => {
  res.json(vps);
});

app.post("/vps/:id", auth, (req, res) => {
  const server = vps.find(v => v.id === req.params.id);

  if (!server) return res.status(404).json({ error: "not found" });

  server.status = req.body.status;

  broadcast({ type: "vps_updated", data: server });

  res.json(server);
});

app.get("/status", auth, (req, res) => {
  res.json({
    system: "UNICORN PRO",
    vps: vps.length
  });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

function broadcast(data) {
  wss.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) {
      c.send(JSON.stringify(data));
    }
  });
}

server.listen(process.env.PORT || 3000, () => {
  console.log("UNICORN PRO ACTIVE 🦄");
});
