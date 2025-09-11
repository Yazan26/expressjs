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

function deleteButtonClicked(userId, buttonElement) {
  console.log('clicked');
    deleteFetch(userId, (error, result) => {
      if (error) {
        console.error(error);
        return error;
      } else {
        alert('customer deleted!')
        let row = buttonElement.closest('tr')
        if (row) row.remove();
        console.log("User deleted successfully");
        return result;
      }
    });
  }
