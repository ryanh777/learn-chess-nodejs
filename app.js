const express = require("express");
const mongoose = require("mongoose");
require("dotenv/config");

const app = express();
const PORT = process.env.PORT || 8080;

// Data parsing
app.use(express.json());
app.use(
  express.urlencoded({
    // Allows nested objects
    extended: true,
  })
);

// Routes
app.use("/user", require("./routes/userRoutes"));
app.use("/data", require("./routes/dataStore"));

// Connect to database
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI);

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(PORT, () => console.log("Server started on port", PORT));
