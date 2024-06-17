document.addEventListener('DOMContentLoaded', function () {
    // Function to fetch all projects and populate select dropdown
    function fetchAndPopulateProjects() {
        fetch('/projects')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch projects');
                }
                return response.json();
            })
            .then(projects => {
                const projectDropdown = document.getElementById('project_id');
                projectDropdown.innerHTML = '';

                projects.forEach(project => {
                    const option = document.createElement('option');
                    option.value = project.id;
                    option.textContent = `Project ID: ${project.id} - ${project.name}`;
                    projectDropdown.appendChild(option);
                });
            })
            .catch(error => {
                console.error('Error fetching projects:', error);
            });
    }

    // Function to fetch all tasks and organize them by project
    function fetchAndDisplayTasksByProject() {
        fetch('/tasks')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                return response.json();
            })
            .then(tasks => {
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
                        console.log(task);
                        const listItem = document.createElement('li');
                        listItem.innerHTML = `
                    <strong>Title:</strong> ${task.title}<br>
                    <strong>Description:</strong> ${task.description}<br>
                    <strong>Date of Creation:</strong> ${task.date_of_creation}<br>
                    <strong>Status:</strong> ${task.status}<br>
                    <button class="deleteTaskBtn" data-task-id="${task.id}">Delete Task</button>
                    <select class="statusSelect" data-task-id="${task.id}">
                        <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Completed" ${task.status === 'Completed' ? 'selected' : ''}>Completed</option>
                    </select><br>
                    <hr>
                `;
                        taskList.appendChild(listItem);
                    });

                    taskListsContainer.appendChild(taskList);
                });

                // Add event listeners to delete buttons
                const deleteButtons = document.querySelectorAll('.deleteTaskBtn');
                deleteButtons.forEach(button => {
                    button.addEventListener('click', function () {
                        const taskId = this.getAttribute('data-task-id');
                        deleteTask(taskId);
                    });
                });

                // Add event listeners to status select dropdowns
                const statusSelects = document.querySelectorAll('.statusSelect');
                statusSelects.forEach(select => {
                    select.addEventListener('change', function () {
                        const taskId = this.getAttribute('data-task-id');
                        const newStatus = this.value;
                        updateTaskStatus(taskId, newStatus);
                    });
                });
            })
            .catch(error => {
                console.error('Error fetching tasks:', error);
            });
    }
    // Function to delete a task
    function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        fetch(`/tasks/${taskId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }
                return response.json();
            })
            .then(data => {
                const responseContainer = document.getElementById('taskResponse');
                responseContainer.textContent = `Task ID ${taskId} deleted successfully`;
                responseContainer.style.color = 'green';
                fetchAndDisplayTasksByProject(); // Refresh task list after deletion
            })
            .catch(error => {
                console.error('Error deleting task:', error);
                const responseContainer = document.getElementById('taskResponse');
                responseContainer.textContent = 'Error deleting task. Please try again.';
                responseContainer.style.color = 'red';
            });
    }

    // Function to update task status
    function updateTaskStatus(taskId, newStatus) {
        const data = { status: newStatus };

        fetch(`/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update task status');
                }
                return response.json();
            })
            .then(data => {
                const responseContainer = document.getElementById('taskResponse');
                responseContainer.textContent = `Task ID ${taskId} status updated to ${newStatus}`;
                responseContainer.style.color = 'green';
                fetchAndDisplayTasksByProject(); // Refresh task list after status update
            })
            .catch(error => {
                console.error('Error updating task status:', error);
                const responseContainer = document.getElementById('taskResponse');
                responseContainer.textContent = 'Error updating task status. Please try again.';
                responseContainer.style.color = 'red';
            });
    }
    // Event listener for form submission (create task)
    function createTask() {
        document.getElementById('createTaskForm').addEventListener('submit', function (event) {
            event.preventDefault();

            const formData = new FormData(this);
            const taskData = {};
            formData.forEach((value, key) => {
                taskData[key] = value;
            });

            // Set the date_of_creation field to the current date/time
            taskData.date_of_creation = new Date().toISOString();

            fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(taskData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to create task');
                    }
                    return response.json();
                })
                .then(data => {
                    const responseContainer = document.getElementById('taskResponse');
                    responseContainer.textContent = `Task created successfully! Task ID: ${data.id}`;
                    responseContainer.style.color = 'green';
                    fetchAndDisplayTasksByProject(); // Refresh task list after creating a task
                    document.getElementById('createTaskForm').reset(); // Reset form after submission
                })
                .catch(error => {
                    console.error('Error creating task:', error);
                    const responseContainer = document.getElementById('taskResponse');
                    responseContainer.textContent = 'Error creating task. Please try again.';
                    responseContainer.style.color = 'red';
                });
        });
    }
    // Fetch and populate projects dropdown when the page loads
    fetchAndPopulateProjects();

    // Fetch and display tasks when the page loads
    fetchAndDisplayTasksByProject();
    //create a task when the form is filled
    createTask()
});
