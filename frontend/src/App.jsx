import { useState, useEffect } from "react";
import "./App.css";
const BACKEND_URL = "https://glistening-clarity-production.up.railway.app";

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
  const [tasks, setTasks] = useState([]); // Yahan tasks store honge

  

  const handleLogin = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      
      const textData = await res.text();

      try {
        const data = JSON.parse(textData);
        
        if (data.token) {
          const userRole = data.role ? data.role : "member"; 
          
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", userRole);
          
          setToken(data.token);
          setRole(userRole);
        } else {
          alert("Login failed: " + textData);
        }
      } catch (parseError) {
        alert("Login Issue: " + textData);
      }
    } catch (err) {
      alert("Server Error! Check if backend is running on port 5000.");
    }
  };

  const loadStats = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/dashboard", {
        headers: { token: token },
      });
      const data = await res.json();
      setDashboard(data);
    } catch (err) {
      console.log("Stats error");
    }
  };

  
  const loadTasks = async () => {
    if (!token) return;
    try {
      const res = await fetch("http://localhost:5000/task");
      const data = await res.json();
      setTasks(data); // State update
    } catch (err) {
      console.log("Task fetch error");
    }
  };

  
  const handleUpdateTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/task/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" })
      });
      loadStats(); // Stats refresh karo
      loadTasks(); // Task list refresh karo
    } catch (err) {
      alert("Error updating task");
    }
  };


  useEffect(() => {
    if (token) {
      loadStats();
      loadTasks();
    }
  }, [token]);

  const handleCreateProject = async () => {
    if (!projectName) return alert("Enter project name");
    const res = await fetch("http://localhost:5000/project", {
      method: "POST",
      headers: { "Content-Type": "application/json", token: token },
      body: JSON.stringify({ name: projectName }),
    });
    alert(await res.text());
    setProjectName(""); 
  };

  const handleCreateTask = async () => {
    if (!taskTitle || !projectId) return alert("Fill required task fields");
    const res = await fetch("http://localhost:5000/task", {
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

  return (
    <div className="app-wrapper">
      <div className="main-container">
        <h1 className="app-title">Ethara AI Workspace</h1>

        {!token ? (
          <div className="card login-card">
            <h2>Sign In</h2>
            <p className="subtitle">Enter your credentials to continue</p>
            <input 
              type="email" 
              placeholder="Email address" 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" 
              placeholder="Password" 
              onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="btn-primary" onClick={handleLogin}>Log In</button>
          </div>
        ) : (
          <div className="dashboard">
            <div className="top-bar">
              <div className="user-info">
                Logged in as: <span className={`badge ${role}`}>{role?.toUpperCase()}</span>
              </div>
              <button className="btn-danger" onClick={handleLogout}>Log Out</button>
            </div>

            <div className="card stats-card">
              <h3>System Overview</h3>
              <div className="stats-grid">
                <div className="stat-box blue">
                  <h4>Total Tasks</h4>
                  <p>{dashboard.total || 0}</p>
                </div>
                <div className="stat-box green">
                  <h4>Completed</h4>
                  <p>{dashboard.done || 0}</p>
                </div>
                <div className="stat-box orange">
                  <h4>Pending</h4>
                  <p>{dashboard.pending || 0}</p>
                </div>
              </div>
            </div>

            {role === "admin" && (
              <div className="admin-grid">
                <div className="card">
                  <h3>New Project</h3>
                  <input 
                    placeholder="Project Name" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)} 
                  />
                  <button className="btn-secondary" onClick={handleCreateProject}>Create Project</button>
                </div>

                <div className="card">
                  <h3>Assign Task</h3>
                  <input 
                    placeholder="Task Title" 
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)} 
                  />
                  <input 
                    placeholder="Project ID" 
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)} 
                  />
                  <input 
                    placeholder="Assignee Email/ID" 
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)} 
                  />
                  <button className="btn-secondary" onClick={handleCreateTask}>Assign Task</button>
                </div>
              </div>
            )}

            {}
            <div className="card">
              <h3>{role === "member" ? "My Assigned Tasks" : "All Team Tasks"}</h3>
              {tasks.length === 0 ? (
                <p>No tasks found.</p>
              ) : (
                <div className="task-list">
                  {tasks.map((task) => (
                    <div key={task._id} className={`task-item ${task.status}`}>
                      <div className="task-details">
                        <h4>{task.title}</h4>
                        <p>Project ID: {task.projectId} | Assignee: {task.assignedTo}</p>
                        <span className={`status ${task.status}`}>{task.status}</span>
                      </div>
                      
                      {/* Agar task pending hai aur user member hai, tabhi button dikhega */}
                      {task.status === "pending" && role === "member" && (
                        <button 
                          className="btn-primary" 
                          style={{ width: "auto" }} 
                          onClick={() => handleUpdateTask(task._id)}
                        >
                          Mark as Done
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}

export default App;