const usersDao = require("../dao/users.dao");
const { put } = require("../routes");
 
const userService={
    get:(userId,callback)=>{
usersDao.get(userId,(error,users)=>{
    if(error) return callback(error,undefined);
    if(users) return callback(undefined,users);
});
    },
    delete:(userId,callback)=>{
        usersDao.delete(userId,(error,result)=>{
            if(error) return callback(error,undefined);
            if(result) return callback(undefined,result);
        });
    },

    post:(user,callback)=>{
        // Implement user creation logic here
        return callback(new Error("Not implemented"), undefined);
    },
    put:(userId,user,callback)=>{
        usersDao.put(userId,user,(error,result)=>{
            if(error) return callback(error,undefined);
            if(result) return callback(undefined,result);
        });
    }
};
 
module.exports = userService;