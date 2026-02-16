import React from "react";
import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // new tasks
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "",
  });

  // filter tasks
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    fetchTasks(); // Fetch tasks from Backend API
  }, []);

  // to fetch all tasks from API
  const fetchTasks = async () => {
    try {
      setLoading(true); // loading showing

      const response = await fetch("http://localhost:3000/api/tasks"); // API endpoint to fetch tasks

      // convert response to json
      const data = await response.json();

      // update state with fetched tasks
      setTasks(data.data); // data.data because API structure is { success: true, data: tasks }

      setLoading(false); // loading is hidden
    } catch (error) {
      console.error("Error Fetching Tasks:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask({
      ...newTask,
      [name]: value,
    });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      alert("Please enter a title for the");
      return;
    }
    try {
      const response = await fetch("http://localhost:3000/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTask),
      });
      const data = await response.json();

      if (response.ok) {
        fetchTasks();

        setNewTask({
          title: "",
          description: "",
          priority: "medium",
          status: "",
        });

        alert("Task Added Successfully!");
      } else {
        alert(data.error || "Failed to add Task!");
      }
    } catch (error) {
      console.error("Error Adding Task:", error);
      alert("Failed to Create Task!");
    }
  };

  const handleCycleStatus = async (taskId, currentStatus) => {
    let nextStatus;
    if (currentStatus === "todo") nextStatus = "in-progress";
    else if (currentStatus === "in-progress") nextStatus = "done";
    else nextStatus = "todo";

    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      if (response.ok) {
        fetchTasks();
      } else {
        alert("Failed to update task status!");
      }
    } catch (error) {
      console.error("Error Updating Task Status: ", error);
      alert("Failed to Update Task Status!");
    }
  };

  const handleDeleteTask = async (taskId, taskTitle) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the task: ${taskTitle}?`,
    );

    if (!confirmDelete) {
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/tasks/${taskId}`,
        {
          method: "DELETE",
        },
      );
      if (response.status === 204 || response.ok) {
        fetchTasks();
        alert("Task is Deleted Successfully!");
      } else {
        alert("Failed to delete task!");
      }
    } catch (error) {
      console.error("Error Deleting Task: ", error);
      alert("Failed to Delete Task!");
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      if (filterStatus !== "all" && task.status !== filterStatus) {
        return false;
      }
      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }

      return true;
    });
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Manager</h1>
      </header>
      <main className="container">
        {/*Task Form*/}
        <div className="add-task-form">
          <h2>Add New Task</h2>
          <form onSubmit={handleAddTask}>
            {/* Title Input */}
            <div className="form-group">
              <label htmlFor="title">Title :</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newTask.title}
                onChange={handleInputChange}
                placeholder="Enter Task Title"
                required
              />
            </div>

            {/*Description Input*/}
            <div className="form-group">
              <label htmlFor="description">Description :</label>
              <textarea
                type="description"
                id="description"
                name="description"
                value={newTask.description}
                onChange={handleInputChange}
                placeholder="Enter the task description"
              />
            </div>

            {/*Status Select*/}
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={newTask.status}
                onChange={handleInputChange}
              >
                <option value="Select Status">Select Status</option>
                <option value="todo">ToDo</option>
                <option value="in-progress">In-Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            {/*Priority Select*/}
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={newTask.priority}
                onChange={handleInputChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            {/*Submit Button*/}
            <button type="submit" className="btn btn-primary">
              Add Task
            </button>
          </form>
        </div>

        {/*Task List*/}
        <div className="task-list-section">
          <h2>Your Task</h2>

          {/* Filter Controls */}
          <div className="filter-section">
            <h3>Filter by Status:</h3>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterStatus === "all" ? "active" : ""}`}
                onClick={() => setFilterStatus("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${filterStatus === "todo" ? "active" : ""}`}
                onClick={() => setFilterStatus("todo")}
              >
                To Do
              </button>
              <button
                className={`filter-btn ${filterStatus === "in-progress" ? "active" : ""}`}
                onClick={() => setFilterStatus("in-progress")}
              >
                In Progress
              </button>
              <button
                className={`filter-btn ${filterStatus === "done" ? "active" : ""}`}
                onClick={() => setFilterStatus("done")}
              >
                Done
              </button>
            </div>

            {/* Filter by Priority */}
            <div className="filter-section">
              <h3>Filter by Priority:</h3>
              <div className="filter-buttons">
                <button
                  className={`filter-btn ${filterPriority === "all" ? "active" : ""}`}
                  onClick={() => setFilterPriority("all")}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${filterPriority === "low" ? "active" : ""}`}
                  onClick={() => setFilterPriority("low")}
                >
                  Low
                </button>
                <button
                  className={`filter-btn ${filterPriority === "medium" ? "active" : ""}`}
                  onClick={() => setFilterPriority("medium")}
                >
                  Medium
                </button>
                <button
                  className={`filter-btn ${filterPriority === "high" ? "active" : ""}`}
                  onClick={() => setFilterPriority("high")}
                >
                  High
                </button>
              </div>
            </div>
          </div>
          {/* Filter task count */}
          <p className="task-count">
            Showing {getFilteredTasks().length} of {tasks.length} tasks
          </p>
          {loading ? (
            <p>Loading Task .... </p>
          ) : (
            <div>
              {getFilteredTasks().length === 0 ? (
                <p className="no-tasks">
                  No tasks found with the selected filters.{" "}
                  <button
                    onClick={() => {
                      setFilterStatus("all");
                      setFilterPriority("all");
                    }}
                    className="btn-clear-filters"
                  >
                    Clear Filters
                  </button>
                </p>
              ) : (
                <ul className="task-list">
                  {getFilteredTasks().map((task) => (
                    <li
                      key={task.id}
                      className={`task-item ${task.status === "done" ? "done" : ""}`}
                    >
                      <div className="task-content">
                        <div className="task-header">
                          {/* Status Cycle Button */}
                          <span
                            className={`status-badge status-${task.status}`}
                            onClick={() =>
                              handleCycleStatus(task.id, task.status)
                            }
                            title="Click to change status"
                          >
                            {task.status === "todo" && "📝 To Do"}
                            {task.status === "in-progress" && "⏳ In Progress"}
                            {task.status === "done" && "✅ Done"}
                          </span>
                          <label
                            htmlFor={`task-${task.id}`}
                            className="task-title-wrapper"
                          >
                            <strong className="task-title">{task.title}</strong>
                          </label>

                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              handleDeleteTask(task.id, task.title)
                            }
                            className="btn-delete"
                            title="Delete task"
                            aria-label="Delete task"
                          >
                            Delete
                          </button>
                        </div>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}

                        <div className="task-badges">
                          <span
                            className={`priority-badge priority-${task.priority}`}
                          >
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
