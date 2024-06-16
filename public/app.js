
// Function to fetch all tasks from the server
function fetchTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = ''; // Clear previous list
            tasks.forEach(task => {
                const li = document.createElement('li');
                li.textContent = `${task.title} - ${task.description} - ${task.status}`;
                taskList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

// Function to create a new task
function createTask() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const due_date = document.getElementById('due_date').value;
    const status = document.getElementById('status').value;
    const project_id = document.getElementById('project_id').value;

    const formData = {
        title,
        description,
        due_date,
        status,
        project_id: parseInt(project_id)
    };

    fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            const taskResponse = document.getElementById('taskResponse');
            taskResponse.style.display = 'block';
            taskResponse.textContent = `Task created successfully! Task ID: ${data.task_id}`;
            fetchTasks(); // Refresh task list after creating a new task
        })
        .catch(error => console.error('Error creating task:', error));
}

// Fetch tasks when the page loads
window.onload = fetchTasks;

// Function to handle form submission (create task)
document.getElementById('createTaskForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Gather form data
    const formData = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        due_date: document.getElementById('due_date').value,
        status: document.getElementById('status').value,
        project_id: parseInt(document.getElementById('project_id').value)
    };

    // POST request to create task
    fetch('/tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            const taskResponse = document.getElementById('taskResponse');
            taskResponse.style.display = 'block';
            taskResponse.textContent = `Task created successfully! Task ID: ${data.task_id}`;
            document.getElementById('createTaskForm').reset(); // Reset form after submission
        })
        .catch(error => console.error('Error creating task:', error));
});