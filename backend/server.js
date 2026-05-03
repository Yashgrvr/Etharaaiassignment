const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

const User = mongoose.model("User", {
  name: String,
  email: String,
  password: String,
  role: String
});

app.get("/", (req, res) => {
  res.send("Server running");
});

app.post("/signup", async (req, res) => {
  const { name, email, password, role } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hash,
    role
  });

  await user.save();

  res.send("User created");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.send("User not found");

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) return res.send("Wrong password");

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );

 
  res.json({ token, role: user.role });
});

const auth = (req, res, next) => {
  const token = req.headers.token; 

  if (!token) return res.status(401).send("Access Denied: No Token");

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

const Project = mongoose.model("Project", {
  name: String,
  user: String
});

app.post("/project", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.send("Only admin can create project");
  }

  const { name } = req.body;

  const project = new Project({
    name,
    user: req.user.id
  });

  await project.save();

  res.send("Project created");
});

app.get("/project", async (req, res) => {
  const data = await Project.find();
  res.json(data);
});

const Task = mongoose.model("Task", {
  title: String,
  projectId: String,
  assignedTo: String,
  status: String
});

app.post("/task", auth, async (req, res) => { 
  const { title, projectId, assignedTo } = req.body;

  const task = new Task({
    title,
    projectId,
    assignedTo,
    status: "pending"
  });

  await task.save();

  res.send("Task created");
});

app.get("/task", async (req, res) => {
  const data = await Task.find();
  res.json(data);
});

app.put("/task/:id", async (req, res) => {
  const { status } = req.body;

  await Task.findByIdAndUpdate(req.params.id, { status });

  res.send("Task updated");
});

app.get("/dashboard", auth, async (req, res) => {
  try {
    const tasks = await Task.find();

    const total = tasks.length;
    const done = tasks.filter(t => t.status === "done").length;
    const pending = tasks.filter(t => t.status === "pending").length;

    res.json({
      total,
      done,
      pending
    });
  } catch (err) {
    res.status(500).send("Dashboard data fetch failed");
  }
});

app.listen(5000, () => {
  console.log("Server started on port 5000");
});