const authService = {
  login: (email, password) => {
    auth.Dao.Login(email, (error, user) => {
        if (error) return callback(error, undefined);

        if (user[0].password === password) {
            return callback(undefined, user[0]);
        }

    });
    }
}