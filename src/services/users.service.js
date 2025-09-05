const usersDao = require('../dao/users.dao');
//const logger = require('../util/logger');
 
 
const usersService = {
 
    get:(userId, callback)=>{
        usersDao.get(userId, (error, users)=>{
            if(error){
                return callback(error, undefined);
            }
            if(users) {
               // logger.debug(users);
                return callback(undefined, users);
            }
        })
 
    },
};

module.exports = usersService;