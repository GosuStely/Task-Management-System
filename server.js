import express from 'express';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 3000;
const dbPath = path.join(__dirname, 'database', 'database.db');
const db = new sqlite3.Database(dbPath);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to handle errors
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

// GET all tasks
app.get('/tasks', (req, res) => {
    db.all('SELECT * FROM tasks', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST a new task
app.post('/tasks', (req, res) => {
    const { title, description, date_of_creation, status, project_id } = req.body;
    const sql = `INSERT INTO tasks (title, description, date_of_creation, status, project_id) VALUES (?, ?, ?, ?, ?)`;
    const params = [title, description, date_of_creation, status, project_id];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Task created successfully',
            task_id: this.lastID
        });
    });
});

// PUT (update) a task's status
app.put('/tasks/:taskId', (req, res) => {
    const taskId = req.params.taskId;
    const { status } = req.body;

    const sql = `UPDATE tasks SET status = ? WHERE id = ?`;
    const params = [status, taskId];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error updating task status:', err);
            return res.status(500).json({ error: 'Failed to update task status' });
        }

        // Fetch the updated task after update (optional)
        const fetchSql = `SELECT * FROM tasks WHERE id = ?`;
        db.get(fetchSql, taskId, (err, row) => {
            if (err) {
                console.error('Error fetching updated task:', err);
                return res.status(500).json({ error: 'Failed to fetch updated task' });
            }
            if (!row) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.json(row);
        });
    });
});

// DELETE a task
app.delete('/tasks/:id', (req, res) => {
    const taskId = req.params.id;
    const sql = `DELETE FROM tasks WHERE id = ?`;
    db.run(sql, taskId, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Task deleted successfully',
            changes: this.changes
        });
    });
});

// GET all projects
app.get('/projects', (req, res) => {
    db.all('SELECT * FROM projects', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// POST a new project
app.post('/projects', (req, res) => {
    const { name, description } = req.body;
    const sql = `INSERT INTO projects (name, description) VALUES (?, ?)`;
    const params = [name, description];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            id: this.lastID,
            name: name
        });
    });
});

// PUT (update) a project
app.put('/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const { name, description } = req.body;
    const sql = `UPDATE projects SET name = ?, description = ? WHERE id = ?`;
    const params = [name, description, projectId];
    db.run(sql, params, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Project updated successfully',
            changes: this.changes
        });
    });
});

// DELETE a project
app.delete('/projects/:id', (req, res) => {
    const projectId = req.params.id;
    const sql = `DELETE FROM projects WHERE id = ?`;
    db.run(sql, projectId, function (err) {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json({
            message: 'Project deleted successfully',
            changes: this.changes
        });
    });
});
// GET all deadlines
app.get('/deadlines', (req, res) => {
    db.all('SELECT * FROM deadlines', (err, rows) => {
        if (err) {
            console.error('Error fetching deadlines:', err.message);
            return res.status(500).json({ error: 'Failed to fetch deadlines' });
        }
        res.json(rows);
    });
});
// POST a new deadline
app.post('/deadlines', (req, res) => {
    const { deadline_date, task_id } = req.body;
    const sql = `INSERT INTO deadlines (deadline_date, task_id) VALUES (?, ?)`;
    const params = [deadline_date, task_id];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error creating deadline:', err.message);
            return res.status(400).json({ error: 'Failed to create deadline' });
        }

        res.json({
            message: 'Deadline created successfully',
            deadline_id: this.lastID
        });
    });
});
// PUT (update) a deadline
app.put('/deadlines/:id', (req, res) => {
    const deadlineId = req.params.id;
    const { deadline_date, task_id } = req.body;
    const sql = `UPDATE deadlines SET deadline_date = ?, task_id = ? WHERE id = ?`;
    const params = [deadline_date, task_id, deadlineId];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error updating deadline:', err.message);
            return res.status(400).json({ error: 'Failed to update deadline' });
        }

        res.json({
            message: 'Deadline updated successfully',
            changes: this.changes
        });
    });
});
// DELETE a deadline
app.delete('/deadlines/:id', (req, res) => {
    const deadlineId = req.params.id;
    const sql = `DELETE FROM deadlines WHERE id = ?`;

    db.run(sql, deadlineId, function (err) {
        if (err) {
            console.error('Error deleting deadline:', err.message);
            return res.status(400).json({ error: 'Failed to delete deadline' });
        }

        res.json({
            message: 'Deadline deleted successfully',
            changes: this.changes
        });
    });
});


// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
