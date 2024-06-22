document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch all projects and populate select dropdown
    async function fetchAndPopulateProjects() {
        try {
            const response = await fetch('/projects');
            if (!response.ok) {
                throw new Error('Failed to fetch projects');
            }
            const projects = await response.json();
            const projectDropdown = document.getElementById('project_id');
            projectDropdown.innerHTML = '';

            projects.forEach(project => {
                const option = document.createElement('option');
                option.value = project.id;
                option.textContent = `Project: ${project.name}`;
                projectDropdown.appendChild(option);
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    // Function to fetch all tasks and organize them by project
    async function fetchAndDisplayTasksByProject() {
        try {
            const response = await fetch('/tasks');
            if (!response.ok) {
                throw new Error('Failed to fetch tasks');
            }
            const tasks = await response.json();
            const tasksByProject = {};

            // Organize tasks by project
            tasks.forEach(task => {
                if (!tasksByProject[task.project_id]) {
                    tasksByProject[task.project_id] = [];
                }
                tasksByProject[task.project_id].push(task);
            });

            // Display tasks grouped by project
            const taskListsContainer = document.getElementById('taskLists');
            taskListsContainer.innerHTML = '';

            Object.keys(tasksByProject).forEach(projectId => {
                const tasksForProject = tasksByProject[projectId];
                const projectHeading = document.createElement('h3');
                projectHeading.textContent = `Project ID: ${projectId}`;
                taskListsContainer.appendChild(projectHeading);

                const taskList = document.createElement('ul');
                tasksForProject.forEach(task => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <strong>Title:</strong> ${task.title}
                        <strong>Description:</strong> ${task.description}
                        <strong>Date of Creation (mm-dd-yyyy):</strong> ${task.date_of_creation}
                        <strong>Status:</strong> ${task.status}
                        <button class="deleteTaskBtn" data-task-id="${task.id}">Delete Task</button>
                        <select class="statusSelect" data-task-id="${task.id}">
                            <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                            <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                        </select>
                        <hr>
                    `;
                    taskList.appendChild(listItem);
                });

                taskListsContainer.appendChild(taskList);
            });

            // Add event listeners to delete buttons
            const deleteButtons = document.querySelectorAll('.deleteTaskBtn');
            deleteButtons.forEach(button => {
                button.addEventListener('click', async function () {
                    const taskId = this.getAttribute('data-task-id');
                    await deleteTask(taskId);
                });
            });

            // Add event listeners to status select dropdowns
            const statusSelects = document.querySelectorAll('.statusSelect');
            statusSelects.forEach(select => {
                select.addEventListener('change', async function () {
                    const taskId = this.getAttribute('data-task-id');
                    const newStatus = this.value;
                    await updateTaskStatus(taskId, newStatus);
                });
            });
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    // Function to delete a task
    async function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete task');
            }

            const responseContainer = document.getElementById('taskResponse');
            responseContainer.textContent = `Task ID ${taskId} deleted successfully`;
            await fetchAndDisplayTasksByProject(); // Refresh task list after deletion
        } catch (error) {
            console.error('Error deleting task:', error);
            const responseContainer = document.getElementById('taskResponse');
            responseContainer.textContent = 'Error deleting task. Please try again.';
        }
    }

    // Function to update task status
    async function updateTaskStatus(taskId, newStatus) {
        const data = { status: newStatus };

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to update task status');
            }

            const responseContainer = document.getElementById('taskResponse');
            responseContainer.textContent = `Task ID ${taskId} status updated to ${newStatus}`;
            await fetchAndDisplayTasksByProject(); // Refresh task list after status update
        } catch (error) {
            console.error('Error updating task status:', error);
            const responseContainer = document.getElementById('taskResponse');
            responseContainer.textContent = 'Error updating task status. Please try again.';
        }
    }

    // Function to handle task creation form submission
    async function createTask() {
        document.getElementById('createTaskForm').addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = new FormData(this);
            const taskData = {};
            formData.forEach((value, key) => {
                taskData[key] = value;
            });

            // Set the date_of_creation field to the current date/time
            // taskData.date_of_creation = new Date().toISOString();
            taskData.date_of_creation = new Date().toLocaleDateString();

            try {
                const response = await fetch('/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(taskData)
                });

                if (!response.ok) {
                    throw new Error('Failed to create task');
                }

                const newTask = await response.json();
                const responseContainer = document.getElementById('taskResponse');
                console.log(newTask);
                responseContainer.textContent = `Task created successfully! Task ID: ${newTask.task_id}`;
                await fetchAndDisplayTasksByProject(); // Refresh task list after creating a task
                document.getElementById('createTaskForm').reset(); // Reset form after submission
            } catch (error) {
                console.error('Error creating task:', error);
                const responseContainer = document.getElementById('taskResponse');
                responseContainer.textContent = 'Error creating task. Please try again.';
            }
        });
    }

    // Fetch and populate projects dropdown when the page loads
    fetchAndPopulateProjects();

    // Fetch and display tasks when the page loads
    fetchAndDisplayTasksByProject();

    // Set up event listener for creating a task
    createTask();
});
