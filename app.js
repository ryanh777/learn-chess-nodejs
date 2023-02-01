const express = require("express");
const mongoose = require("mongoose");
const Student = require("./models/Student")
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
// app.use("/user", require("./routes/userRoutes"));
// app.use("/data", require("./routes/dataStore"));

app.post("/", async (req, res) => {
    // try {
    //     console.log(req.body)
    //     res.json("gucci in the coochi")
    // } catch (err) {
    //     console.log('error')
    //     res.json(err)
    // }
    const student = new Student({
        name: req.body.name,
        grade: req.body.grade
     });
  
     try {
        const savedStudent = await student.save();
        res.json(savedStudent._id);
     } catch (err) {
        res.json(err);
     }
})

// Connect to database
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_URI);

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(PORT, () => console.log("Server started on port", PORT));
