
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const axios = require("axios");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

const leads = new Map();

app.get("/", (req, res) => {
  res.json({ status: "Meta Lead PoC backend running" });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Meta webhook verification
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.META_VERIFY_TOKEN
  ) {
    console.log("Meta webhook verified successfully");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
});

// Meta sends lead notifications here
app.post("/webhook", (req, res) => {
  // Acknowledge Meta promptly, then process the notification.
  res.sendStatus(200);

  if (req.body?.object !== "page") {
    console.log("Ignoring non-Page webhook event");
    return;
  }

  processWebhook(req.body).catch((error) => {
    console.error("Webhook processing error:", error.message);
  });
});

async function processWebhook(body) {
  for (const entry of body.entry || []) {
    for (const change of entry.changes || []) {
      if (change.field !== "leadgen") continue;

      const leadId = change.value?.leadgen_id;
      if (!leadId || leads.has(leadId)) continue;

      try {
        const response = await axios.get(
          `https://graph.facebook.com/${process.env.META_GRAPH_VERSION}/${leadId}`,
          {
            params: {
              fields: "id,created_time,field_data,form_id",
              access_token: process.env.META_ACCESS_TOKEN,
            },
            timeout: 15000,
          }
        );

        const lead = response.data;
        leads.set(lead.id, lead);
        io.emit("new_lead", lead);

        console.log("New lead retrieved and sent to mobile:", lead.id);
      } catch (error) {
        console.error(
          "Lead retrieval failed:",
          error.response?.data || error.message
        );
      }
    }
  }
}

// Return leads to clients that connect after a lead arrived
app.get("/leads", (req, res) => {
  res.json(Array.from(leads.values()).reverse());
});

// Test endpoint for checking mobile delivery
app.post("/test-lead", (req, res) => {
  const lead = {
    id: `test-${Date.now()}`,
    created_time: new Date().toISOString(),
    field_data: [
      { name: "full_name", values: ["Test Lead"] },
      { name: "email", values: ["test@example.com"] },
      { name: "phone_number", values: ["+1234567890"] },
    ],
  };

  leads.set(lead.id, lead);
  io.emit("new_lead", lead);

  res.json({ message: "Test lead sent", lead });
});

io.on("connection", (socket) => {
  console.log("Mobile client connected:", socket.id);
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running on port ${PORT}`);
});
