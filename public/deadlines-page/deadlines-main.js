document.addEventListener('DOMContentLoaded', async function () {
    await fetchTasks();
    await fetchDeadlines();

    // Handle form submission for creating a new deadline
    document.getElementById('create-deadline-form').addEventListener('submit', async function (e) {
        e.preventDefault();
        await createDeadline();
    });
});

// Fetch all tasks and populate the dropdown with task names
async function fetchTasks() {
    try {
        const response = await fetch('/tasks');
        const tasks = await response.json();

        const taskSelect = document.getElementById('task-id');
        tasks.forEach(task => {
            taskMap[task.id] = task.title; // Store task title by ID for lookup
            const option = document.createElement('option');
            option.value = task.id;
            option.textContent = task.title; // Only task title shown in the dropdown
            taskSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching tasks:', error);
    }
}

// Fetch all deadlines and display them in the table
async function fetchDeadlines() {
    try {
        const response = await fetch('/deadlines');
        const deadlines = await response.json();

        const tableBody = document.querySelector('#deadlines-table tbody');
        tableBody.innerHTML = '';
        deadlines.forEach(deadline => {
            if (getTaskNameById(deadline.task_id)) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="date" value="${deadline.deadline_date}" onchange="updateDeadline(${deadline.id}, this.value, ${deadline.task_id})"></td>
                    <td>${getTaskNameById(deadline.task_id)}</td>
                    <td class="actions">
                        <button onclick="deleteDeadline(${deadline.id})">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            }
        });
    } catch (error) {
        console.error('Error fetching deadlines:', error);
    }
}

// Store fetched tasks to use for displaying task names in the table
let taskMap = {};

// Retrieve the task name by its ID
function getTaskNameById(taskId) {
    return taskMap[taskId] || false;
}

// Create a new deadline
async function createDeadline() {
    try {
        const deadlineDate = document.getElementById('deadline-date').value;
        const taskId = document.getElementById('task-id').value;

        const response = await fetch('/deadlines', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deadline_date: deadlineDate,
                task_id: taskId,
            }),
        });

        const data = await response.json();
        alert(data.message);
        await fetchDeadlines();
        document.getElementById('create-deadline-form').reset(); // Clear the form
    } catch (error) {
        console.error('Error creating deadline:', error);
    }
}

// Update an existing deadline's date
async function updateDeadline(id, newDate, taskId) {
    try {
        const response = await fetch(`/deadlines/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                deadline_date: newDate,
                task_id: taskId
            }),
        });

        const data = await response.json();
        alert(data.message);
        await fetchDeadlines();
    } catch (error) {
        console.error('Error updating deadline:', error);
    }
}

// Delete a deadline
async function deleteDeadline(id) {
    try {
        const response = await fetch(`/deadlines/${id}`, {
            method: 'DELETE',
        });

        const data = await response.json();
        alert(data.message);
        await fetchDeadlines();
    } catch (error) {
        console.error('Error deleting deadline:', error);
    }
}
