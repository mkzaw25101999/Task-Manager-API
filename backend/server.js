const express = require("express"); // Import Express framework
const cors = require("cors"); // Import CORS middleware

const app = express(); // Create an Express application

const PORT = 3000; // Define the port number

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON request bodies

let tasks = []; // In-memory array to store tasks

let nextId = 1;

// route to get all tasks
app.get("/api/tasks", (req, res) => {
  //filtering tasks by completed status
  let filteredTasks = tasks;
  if (req.query.completed !== undefined) {
    const isCompleted = req.query.completed === "true"; // Convert query parameter to boolean

    filteredTasks = tasks.filter((task) => task.completed === isCompleted);
  }

  // search tasks by title
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();

    filteredTasks = filteredTasks.filter((task) =>
      task.title.toLowerCase().includes(searchTerm),
    );
  }
  if (req.query.priority) {
    const validPriorities = ["low", "medium", "high"];
    const requestedPriority = req.query.priority.toLowerCase();

    if (!validPriorities.includes(requestedPriority)) {
      return res.status(400).json({
        success: false,
        error: "Priority must be low or medium or high!",
      });
    }
    filteredTasks = filteredTasks.filter(
      (task) => task.priority === requestedPriority,
    );
  }
  res.json({
    success: true,
    count: filteredTasks.length,
    data: filteredTasks,
  });
});

// route to get a task by id
app.get("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id); // Get the task ID from the URL parameters
  const task = tasks.find((t) => t.id === taskId); // Find the task with the matching ID

  if (!task) {
    return res.status(404).json({
      success: false,
      error: "Task Not Found!",
    });
  }

  res.json({
    success: true,
    data: task,
  });
});

// route to create a new task
app.post("/api/tasks", (req, res) => {
  const { title, description, status, priority } = req.body; // Get task details from the request body

  if (!title || title.trim() === "") {
    return res.status(400).json({
      success: false,
      error: "Title is required and cannot be empty!",
    });
  }

  // priority check
  const validPriorities = ["low", "medium", "high"];
  const taskPriority = priority || "medium"; // default is medium
  if (!validPriorities.includes(taskPriority)) {
    return res.status(400).json({
      success: false,
      error: "Priority must be low or medium or high!",
    });
  }

  const validStatuses = ["todo", "in-progress", "done"];
  const taskStatus = status && status !== "Select Status" ? status : "todo"; // default is todo

  if (!validStatuses.includes(taskStatus)) {
    return res.status(400).json({
      success: false,
      error: "Status must be todo or in-progress or done!",
    });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description || "", // can be empty string if not provided
    status: taskStatus, // default to false if not provided
    priority: taskPriority, // default to medium if not provided
  };

  tasks.push(newTask); // Add the new task to the in-memory array

  res.status(201).json({
    success: true,
    data: newTask,
  });
});

// route to update a task by id
app.put("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id); // Get the task ID from the URL parameters
  const task = tasks.find((t) => t.id === taskId); // Find the task with the matching ID

  if (!task) {
    return res.status(404).json({
      success: false,
      error: "Task Not Found!",
    });
  }

  const { title, description, status, priority } = req.body;

  // undefined check allows update of only specific fields
  if (title !== undefined) {
    task.title = title.trim();
  }
  if (description !== undefined) {
    task.description = description;
  }
  if (status !== undefined) {
    const validStatuses = ["todo", "in-progress", "done"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: "Status must be todo or in-progress or done!",
      });
    }
    task.status = status;
  }
  if (priority !== undefined) {
    const validPriorities = ["low", "medium", "high"];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        success: false,
        error: "Priority must be low or medium or high!",
      });
    }
    task.priority = priority;
  }

  res.json({
    success: true,
    data: task,
  });
});

// route to delete a task by id
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Task Not Found!",
    });
  }

  tasks.splice(taskIndex, 1); // Remove the one task from array

  res.status(204).send();
});

// start the server
app.listen(PORT, () => {
  console.log(`Server is running on the port ${PORT}`);
  console.log(`API Endpoints:`);
  console.log(`GET /tasks - Get all tasks`);
  console.log(`GET /tasks/:id - Get a task by ID`);
  console.log(`POST /api/tasks - Create a new task`);
  console.log(`PUT /api/tasks/:id - Update a task by ID`);
  console.log(`DELETE /api/tasks/:id - Delete a task by ID`);
});
