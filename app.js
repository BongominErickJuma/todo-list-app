import express from "express";
import pg from "pg";
import env from "dotenv";

const app = express();
const PORT = process.env.PORT || 3000;
env.config();

// PostgreSQL configuratio

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const createUsersTable = `
    CREATE TABLE IF NOT EXISTS  todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL
    );
`;

db.query(createUsersTable, (err) => {
  if (err) {
    console.error("Error creating posts table:", err);
  } else {
    console.log("Posts table created successfully!");
  }
});

// Routes
app.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM todos ORDER BY id DESC");
    const todos = result.rows;
    res.render("index.ejs", { todos });
  } catch (err) {
    console.error("Error fetching todos", err);
    res.status(500).send("Error fetching todos");
  }
});

app.get("/todos/new", (req, res) => {
  res.render("new.ejs");
});

app.post("/todos", async (req, res) => {
  const { task } = req.body;
  try {
    await db.query("INSERT INTO todos (task) VALUES ($1)", [task]);
    res.redirect("/");
  } catch (err) {
    console.error("Error adding todo", err);
    res.status(500).send("Error adding todo");
  }
});

app.get("/todos/:id/edit", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query("SELECT * FROM todos WHERE id = $1", [id]);
    const todo = result.rows[0];
    res.render("edit.ejs", { todo });
  } catch (err) {
    console.error("Error fetching todo", err);
    res.status(500).send("Error fetching todo");
  }
});

app.post("/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { task } = req.body;
  try {
    await db.query("UPDATE todos SET task = $1 WHERE id = $2", [task, id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error updating todo", err);
    res.status(500).send("Error updating todo");
  }
});

app.post("/todos/:id/delete", async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM todos WHERE id = $1", [id]);
    res.redirect("/");
  } catch (err) {
    console.error("Error deleting todo", err);
    res.status(500).send("Error deleting todo");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
