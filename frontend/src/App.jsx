import { useState, useEffect } from "react";
import "./App.css";


const BACKEND_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://glistening-clarity-production.up.railway.app";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));
  const [projectName, setProjectName] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [projectId, setProjectId] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [dashboard, setDashboard] = useState({ total: 0, done: 0, pending: 0 });
  const [tasks, setTasks] = useState([]);

 
  const handleLogin = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);
        setToken(data.token);
        setRole(data.role);
      } else {
        alert("Invalid Credentials");
      }
    } catch (err) {
      alert("Server Error! Make sure backend is running.");
    }
  };

  // Load Stats
  const loadStats = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/dashboard`, {
        headers: { token: token },
      });
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.log("Stats error");
    }
  };

  // Load Tasks
  const loadTasks = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/task`);
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.log("Task fetch error");
    }
  };

  // Update Task Status
  const handleUpdateTask = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/task/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" })
      });
      loadStats();
      loadTasks();
    } catch (err) {
      alert("Error updating task");
    }
  };

  // Create Project (Admin Only)
  const handleCreateProject = async () => {
    if (!projectName) return alert("Enter project name");
    const res = await fetch(`${BACKEND_URL}/project`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify({ name: projectName }),
    });
    alert(await res.text());
    setProjectName(""); 
  };

  // Assign Task (Admin Only)
  const handleCreateTask = async () => {
    if (!taskTitle || !projectId) return alert("Fill required task fields");
    const res = await fetch(`${BACKEND_URL}/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify({ title: taskTitle, projectId, assignedTo }),
    });
    alert(await res.text());
    loadStats(); 
    loadTasks();
    setTaskTitle("");
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setRole(null);
  };

  useEffect(() => {
    if (token) {
      loadStats();
      loadTasks();
    }
  }, [token]);

  return (
    <div className="app-wrapper">
      <div className="main-container">
        <h1 className="app-title">Ethara AI Workspace</h1>

        {!token ? (
          <div className="card login-card">
            <h2>Sign In</h2>
            <p className="subtitle">Enter credentials to continue</p>
            <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            <button className="btn-primary" onClick={handleLogin}>Log In</button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="top-bar">
              <div className="user-info">Role: <span className={`badge ${role}`}>{role?.toUpperCase()}</span></div>
              <button className="btn-danger" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="card stats-card">
              <h3>System Overview</h3>
              <div className="stats-grid">
                <div className="stat-box blue"><h4>Total</h4><p>{dashboard.total || 0}</p></div>
                <div className="stat-box green"><h4>Done</h4><p>{dashboard.done || 0}</p></div>
                <div className="stat-box orange"><h4>Pending</h4><p>{dashboard.pending || 0}</p></div>
              </div>
            </div>

            {role === "admin" && (
              <div className="admin-grid">
                <div className="card">
                  <h3>New Project</h3>
                  <input placeholder="Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                  <button className="btn-secondary" onClick={handleCreateProject}>Create</button>
                </div>
                <div className="card">
                  <h3>Assign Task</h3>
                  <input placeholder="Title" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} />
                  <input placeholder="Project ID" value={projectId} onChange={(e) => setProjectId(e.target.value)} />
                  <input placeholder="Assignee Email" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
                  <button className="btn-secondary" onClick={handleCreateTask}>Assign</button>
                </div>
              </div>
            )}

            <div className="card">
              <h3>Tasks</h3>
              <div className="task-list">
                {tasks.map((task) => (
                  <div key={task._id} className={`task-item ${task.status}`}>
                    <div className="task-details">
                      <h4>{task.title}</h4>
                      <p>ID: {task._id} | Assigned to: {task.assignedTo}</p>
                    </div>
                    {task.status === "pending" && role === "member" && (
                      <button className="btn-primary" onClick={() => handleUpdateTask(task._id)}>Done</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;