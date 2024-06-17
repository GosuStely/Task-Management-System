document.addEventListener('DOMContentLoaded', () => {
    // Function to fetch and display projects
    async function fetchProjects() {
        try {
            const response = await fetch('/projects');
            const data = await response.json();
            const projectList = document.getElementById('projectList');
            projectList.innerHTML = ''; // Clear previous list

            data.forEach(project => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${project.id}</td>
                    <td>${project.name}</td>
                    <td>
                        <button class="deleteButton" data-id="${project.id}">Delete</button>
                    </td>
                `;
                projectList.appendChild(row);
            });

            // Add event listeners to delete buttons
            document.querySelectorAll('.deleteButton').forEach(button => {
                button.addEventListener('click', async function () {
                    const projectId = button.getAttribute('data-id');
                    await deleteProject(projectId);
                });
            });
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    }

    // Function to create a project
    async function createProject(event) {
        event.preventDefault(); // Prevent default form submission

        const projectName = document.getElementById('projectName').value;

        try {
            const response = await fetch('/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: projectName })
            });

            const data = await response.json();
            const responseContainer = document.getElementById('responseContainer');
            responseContainer.textContent = `Project created successfully! Project ID: ${data.id}`;
            responseContainer.style.color = 'green';
            await fetchProjects(); // Refresh project list after creation
            document.getElementById('createProjectForm').reset(); // Reset form after submission
        } catch (error) {
            console.error('Error creating project:', error);
            const responseContainer = document.getElementById('responseContainer');
            responseContainer.textContent = 'Error creating project. Please try again.';
            responseContainer.style.color = 'red';
        }
    }

    // Function to rename a project
    async function renameProject(event) {
        event.preventDefault(); // Prevent default form submission

        const projectId = parseInt(document.getElementById('projectId').value);
        const newProjectName = document.getElementById('newProjectName').value;

        try {
            const response = await fetch(`/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newProjectName })
            });

            const data = await response.json();
            console.log(data);
            const responseContainer = document.getElementById('responseContainer');
            responseContainer.textContent = `Project renamed successfully! New Project Name: ${newProjectName}`;
            responseContainer.style.color = 'green';
            await fetchProjects(); // Refresh project list after renaming project
            document.getElementById('renameProjectForm').reset(); // Reset form after submission
        } catch (error) {
            console.error('Error renaming project:', error);
            const responseContainer = document.getElementById('responseContainer');
            responseContainer.textContent = 'Error renaming project. Please try again.';
            responseContainer.style.color = 'red';
        }
    }

    // Function to delete a project
    async function deleteProject(projectId) {
        if (confirm(`Are you sure you want to delete project ID ${projectId}?`)) {
            try {
                const response = await fetch(`/projects/${projectId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    const responseContainer = document.getElementById('responseContainer');
                    responseContainer.textContent = `Project deleted successfully! Project ID: ${projectId}`;
                    responseContainer.style.color = 'green';
                    await fetchProjects(); // Refresh project list after deletion
                } else {
                    throw new Error('Failed to delete project.');
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                const responseContainer = document.getElementById('responseContainer');
                responseContainer.textContent = 'Error deleting project. Please try again.';
                responseContainer.style.color = 'red';
            }
        }
    }

    // Initial fetch of projects when page loads
    fetchProjects();

    // Event listener for form submission (create project)
    document.getElementById('createProjectForm').addEventListener('submit', createProject);

    // Event listener for form submission (rename project)
    document.getElementById('renameProjectForm').addEventListener('submit', renameProject);
});
