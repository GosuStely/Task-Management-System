import sqlite3 from 'sqlite3';

// Connect to SQLite database file
const db = new sqlite3.Database('./database/database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Create tasks table
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    date_of_creation TEXT,
    status TEXT,
    project_id INTEGER,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  )`);

    // Create projects table
    db.run(`CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
  )`);

    // Create deadlines table
    db.run(`CREATE TABLE IF NOT EXISTS deadlines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    deadline_date TEXT NOT NULL,
    task_id INTEGER,
    FOREIGN KEY (task_id) REFERENCES tasks(id)
  )`);

    // Insert dummy data for projects
    db.run(`INSERT INTO projects (name) VALUES
    ('Project A'),
    ('Project B'),
    ('Project C')`, (err) => {
        if (err) {
            console.error('Error inserting projects:', err.message);
            throw err;
        }
        console.log('Inserted projects into the database.');
    });

    // Insert dummy data for tasks
    db.run(`INSERT INTO tasks (title, description, date_of_creation, status, project_id) VALUES
    ('Task 1', 'Task 1 description', '2024-06-30', 'In Progress', 1),
    ('Task 2', 'Task 2 description', '2024-07-15', 'Pending', 1),
    ('Task 3', 'Task 3 description', '2024-07-10', 'Completed', 2),
    ('Task 4', 'Task 4 description', '2024-07-20', 'Pending', 2),
    ('Task 5', 'Task 5 description', '2024-08-05', 'In Progress', 3),
    ('Task 6', 'Task 6 description', '2024-08-10', 'Pending', 3),
    ('Task 7', 'Task 7 description', '2024-08-15', 'Completed', 3)`, (err) => {
        if (err) {
            console.error('Error inserting tasks:', err.message);
            throw err;
        }
        console.log('Inserted tasks into the database.');
    });
});

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
        throw err;
    }
    console.log('Closed the SQLite database connection.');
});
