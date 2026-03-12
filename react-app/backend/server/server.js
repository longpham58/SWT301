const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/students", require("./routes/student.routes"));
app.use("/api/scores", require("./routes/score.routes"));
app.use("/api/schedules", require("./routes/schedule.routes"));
app.use("/api/rooms", require("./routes/room.routes"));

// Start server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});