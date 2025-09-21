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

// Deprecated inline alert; use mxAlert helper from alerts.js
function showAlert(message, type = 'success') {
  if (window.mxAlert) {
    mxAlert(message, type === 'danger' ? 'danger' : type, { timeout: 4000 });
  } else {
    // Fallback to native alert if mxAlert not loaded
    alert(message);
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
  // Removed legacy alertDiv listeners; handled by mxAlert

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
