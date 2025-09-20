function deleteFetch(userId, callback) {
  fetch(`/users/${userId}`, { method: 'DELETE', headers: { 'Accept': 'application/json' } })
    .then(async (response) => {
      const contentType = response.headers.get('content-type') || '';
      let text;
      try {
        text = await response.text();
      } catch (e) {
        text = '';
      }

      let data;
      if (contentType.includes('application/json')) {
        try { data = text ? JSON.parse(text) : undefined; } catch (e) { /* ignore parse error */ }
      }

      if (!response.ok) {
        const message = (data && (data.message || data.error)) || (text || 'Delete failed');
        return callback(new Error(message), undefined);
      }
      return callback(undefined, data || { message: 'User deleted' });
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
