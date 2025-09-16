const authService = {

  login: (email, password) => {
    auth.Dao.Login(email, (error, user) => {
        if (error) return callback(error, undefined);

        if (user[0].password === password) {
            return callback(undefined, user[0]);
        }

    });
    },

    register: (email, password, callback) => {
        auth.Dao.register(email, password, (error, user) => {
            if (error) return callback(error, undefined);
            return callback(undefined, user);
        }
        );
    },

    validate: (code, callback) => {
        auth.Dao.validate(code, (error, user) => {
            if (error) return callback(error, undefined);
            return callback(undefined, user);
        }
        );
    },
}