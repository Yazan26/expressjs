function deleteFetch(userId, callback) {
  fetch(`/users/${userId}/delete`, {method: 'DELETE'})
  .then((res) => res.json())
  .then((data) => {
    callback(undefined, data);
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
      } if (result) {
        console.log("User deleted successfully");
        return result;
      }
    });
  }
