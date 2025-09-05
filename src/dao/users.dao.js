const data = require('../db/sql/example.data');

const usersDao = {
    get: (userId, callback) => {
        if (userId == undefined) {
            return callback(undefined, data);
        }
        else{
            let user = data.filter((user) => user.id == userId)[0]
            return callback(undefined, [user]);
        }
    },
    delete: (userId, callback) => {
        let index = data.findIndex((user) => user.id == userId);
        if (index == -1) {
            return callback(new Error("User not found"), undefined);
        }
        data.splice(index, 1);
        return callback(undefined, { message: "User deleted successfully" });
    },

    post: (user, callback) => {
        // Implement user creation logic here
        return callback(new Error("Not implemented"), undefined);
    },
    put: (userId, user, callback) => {
        // Implement user update logic here
        return callback(new Error("Not implemented"), undefined);
    }

};

module.exports = usersDao;