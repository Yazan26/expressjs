const bcrypt = require('bcrypt');

const hash = {
    create: (password, callback) => {
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) return callback(err, undefined);
            return callback(undefined, hash);
        });
    },

    compare:(enteredPass, hashedPassword, callback)=>{
        bcrypt.compare(enteredPass, hashedPassword, (err, res) => {
            if (err) return callback(err, undefined);
            return callback(undefined, res);
        });
    },
}

module.exports = hash;
