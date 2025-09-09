const { update } = require("../controllers/users.controller");
const usersDao = require("../dao/users.dao");

const userService={
    get:(userId,callback)=>{
usersDao.get(userId,(error,users)=>{
    if(error) return callback(error,undefined);
    if(users) {
        if(userId==undefined) return callback(undefined,users);
        let user = users.filter((user)=>user.customer_id == userId)[0];
        console.log(user)
        return callback(undefined,[user])};
});
    },
    update:(email,userId,first_name,last_name,callback)=>{
            usersDao.update(email,userId,first_name,last_name,(error,result)=>{
                if(error) return callback(error,undefined);
                if(result) return callback(userId,(undefined,result));

            });
        },

    
    delete:(userId,callback)=>{
        usersDao.get.get(userId,(error,users)=>[]);
               let user = users.filter((user)=>user.customer_id == userId[0]);
            return callback(undefined,[user]);
    }
}

module.exports = userService;