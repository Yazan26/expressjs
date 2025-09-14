function deleteFetch(userId, callback) {
  fetch(`/users/${userId}`, {method: 'DELETE'})
    .then((data) => {
      console.log(data);
      return callback(undefined, data);
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

function deleteButtonClicked(userId, buttonElement) {
  deleteFetch(userId, (error, result) => {
    if (error) {
      console.error(error);
      showAlert("Error deleting user!", "danger");
      return error;
    } else {
      showAlert("Customer deleted successfully!", "success");
      let row = buttonElement.closest('tr');
      if (row) row.remove();
      console.log("User deleted successfully");
      return result;
    }
  });
}


document.addEventListener('DOMContentLoaded', function () {
  const alertDiv = document.getElementById('deleteAlert');
  if (alertDiv) {
    alertDiv.addEventListener('closed.bs.alert', function () {
      alertDiv.classList.remove('d-none');
      alertDiv.classList.remove('show');
    });
  }
});