function deleteFetch(userId, callback) {
  fetch(`/users/${userId}`, {method: 'DELETE'})
    .then((response) => {
      if (!response.ok) {
        return response.json().then((data) => {
          return callback(new Error(data.message || 'Delete failed'), undefined);
        });
      }
      return response.json().then((data) => {
        return callback(undefined, data);
      });
    })
    .catch((err) => {
      callback(err, undefined);
    });
}

function showAlert(message, type = 'success') {
  const alertDiv = document.getElementById('deleteAlert');
  if (alertDiv) {
    const msg = alertDiv.querySelector('.alert-message');
    if (msg) msg.textContent = message;
    alertDiv.classList.remove('d-none');
    alertDiv.classList.remove('alert-success', 'alert-danger');
    alertDiv.classList.add('show', type === 'success' ? 'alert-success' : 'alert-danger');
    // Auto-hide after 3 seconds
    setTimeout(() => {
      alertDiv.classList.add('d-none');
      alertDiv.classList.remove('show');
    }, 3000);
  }
}

let pendingDeleteUserId = null;
let pendingDeleteButton = null;

function deleteButtonClicked(userId, buttonElement) {
  pendingDeleteUserId = userId;
  pendingDeleteButton = buttonElement;
  // Show Bootstrap modal
  const modal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  modal.show();
}


document.addEventListener('DOMContentLoaded', function () {
  const alertDiv = document.getElementById('deleteAlert');
  if (alertDiv) {
    alertDiv.addEventListener('closed.bs.alert', function () {
      alertDiv.classList.remove('d-none');
      alertDiv.classList.remove('show');
    });
  }

  // Confirm delete button handler
  const confirmBtn = document.getElementById('confirmDeleteBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      if (pendingDeleteUserId && pendingDeleteButton) {
        deleteFetch(pendingDeleteUserId, (error, result) => {
          if (error) {
            console.error(error);
            showAlert(error.message, "danger");
          } else {
            showAlert(result.message || "Customer deleted successfully!", "success");
            let row = pendingDeleteButton.closest('tr');
            if (row) row.remove();
            console.log("User deleted successfully");
          }
          // Hide modal after action
          const modalEl = document.getElementById('deleteConfirmModal');
          const modal = bootstrap.Modal.getInstance(modalEl);
          if (modal) modal.hide();
          pendingDeleteUserId = null;
          pendingDeleteButton = null;
        });
      }
    });
  }
});