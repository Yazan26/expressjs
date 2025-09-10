function deleteFetch(userId, callback) {
  fetch(`/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      callback(null, true);
    } else {
      callback(new Error("Failed to delete user"), false);
    }
  });
}

function deleteButtonClicked(userId, buttonElement) {
  buttonElement.addEventListener('click', () => {
    deleteFetch(userId, (error, result) => {
      if (error) {
        console.error(error);
      } if (result) {
        console.log("User deleted successfully");
      }
    });
  });
}