// Function to fetch and display all deadlines
function fetchAndDisplayDeadlines() {
    fetch('/deadlines')
        .then(response => response.json())
        .then(deadlines => {
            const deadlineListContainer = document.getElementById('deadlineListContainer');
            deadlineListContainer.innerHTML = '';

            deadlines.forEach(deadline => {
                const deadlineItem = document.createElement('div');
                deadlineItem.classList.add('deadline-item');
                deadlineItem.innerHTML = `
                    <p><strong>Deadline ID:</strong> ${deadline.id}</p>
                    <p><strong>Deadline Date:</strong> ${deadline.deadline_date}</p>
                    <p><strong>Task ID:</strong> ${deadline.task_id}</p>
                    <button class="deleteDeadlineBtn" data-deadline-id="${deadline.id}">Delete</button>
                    <button class="editDeadlineBtn" data-deadline-id="${deadline.id}">Edit</button>
                    <hr>
                `;
                deadlineListContainer.appendChild(deadlineItem);

                // Add event listener for delete button
                const deleteBtn = deadlineItem.querySelector('.deleteDeadlineBtn');
                deleteBtn.addEventListener('click', () => deleteDeadline(deadline.id));

                // Add event listener for edit button
                const editBtn = deadlineItem.querySelector('.editDeadlineBtn');
                editBtn.addEventListener('click', () => showEditForm(deadline));
            });
        })
        .catch(error => console.error('Error fetching deadlines:', error));
}

// Function to handle form submission (create new deadline)
document.getElementById('createDeadlineForm').addEventListener('submit', function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const deadlineData = {};
    formData.forEach((value, key) => {
        deadlineData[key] = value;
    });

    fetch('/deadlines', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(deadlineData)
    })
        .then(response => response.json())
        .then(data => {
            alert('Deadline created successfully!');
            fetchAndDisplayDeadlines(); // Refresh the deadline list
            document.getElementById('createDeadlineForm').reset(); // Reset the form
        })
        .catch(error => console.error('Error creating deadline:', error));
});

// Function to delete a deadline
function deleteDeadline(deadlineId) {
    if (!confirm('Are you sure you want to delete this deadline?')) {
        return;
    }

    fetch(`/deadlines/${deadlineId}`, {
        method: 'DELETE'
    })
        .then(response => {
            if (response.ok) {
                alert('Deadline deleted successfully!');
                fetchAndDisplayDeadlines(); // Refresh the deadline list
            } else {
                throw new Error('Failed to delete deadline');
            }
        })
        .catch(error => console.error('Error deleting deadline:', error));
}

// Function to show edit form with pre-filled data
function showEditForm(deadline) {
    const editFormContainer = document.createElement('div');
    editFormContainer.innerHTML = `
        <h3>Edit Deadline</h3>
        <form id="editDeadlineForm">
            <input type="hidden" name="id" value="${deadline.id}">
            <div>
                <label for="edit_deadline_date">Deadline Date:</label>
                <input type="date" id="edit_deadline_date" name="deadline_date" value="${deadline.deadline_date}" required>
            </div>
            <div>
                <label for="edit_task_id">Task ID:</label>
                <input type="number" id="edit_task_id" name="task_id" value="${deadline.task_id}" required>
            </div>
            <button type="submit">Update Deadline</button>
            <button type="button" onclick="cancelEditForm()">Cancel</button>
        </form>
    `;
    editFormContainer.classList.add('edit-form');

    // Handle form submission for updating deadline
    editFormContainer.querySelector('#editDeadlineForm').addEventListener('submit', function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const updatedDeadlineData = {};
        formData.forEach((value, key) => {
            updatedDeadlineData[key] = value;
        });

        fetch(`/deadlines/${deadline.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedDeadlineData)
        })
            .then(response => response.json())
            .then(data => {
                alert('Deadline updated successfully!');
                fetchAndDisplayDeadlines(); // Refresh the deadline list
                editFormContainer.remove(); // Remove edit form after updating
            })
            .catch(error => console.error('Error updating deadline:', error));
    });

    // Append edit form to the document
    document.getElementById('deadlineListContainer').appendChild(editFormContainer);
}

// Function to cancel editing and close edit form
function cancelEditForm() {
    const editForm = document.querySelector('.edit-form');
    if (editForm) {
        editForm.remove();
    }
}

// Fetch and display deadlines when the page loads
document.addEventListener('DOMContentLoaded', fetchAndDisplayDeadlines);