const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 5500;
const LOG_FILE = "treeview.log";

app.use(cors());
app.use(express.json());

// ✅ Log function to append logs to the file
const logAction = (action, label) => {
  const timestamp = new Date().toISOString();
  const logEntry = `${action}: ${label} - ${timestamp}\n`;
  fs.appendFile(LOG_FILE, logEntry, "utf8", (err) => {
    if (err) console.error("Error writing log:", err);
  });
};

// ✅ API to log actions
app.post("/log", (req, res) => {
  const { action, label } = req.body;
  if (!action || !label) {
    return res.status(400).json({ message: "Invalid request" });
  }

  logAction(action, label);
  res.json({ message: "Log recorded" });
});

// ✅ API to clear logs (for testing)
app.get("/clear-log", (req, res) => {
  fs.writeFile(LOG_FILE, "", (err) => {
    if (err) return res.status(500).json({ message: "Failed to clear log" });
    res.json({ message: "Log cleared" });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
