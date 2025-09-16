const database = require('../db/sql/connection');
const hash = require('../util/hash');

const authDao = {
    
    findByUsername: async (username) => {
        const db = await database.getDb();
        const sql = 'SELECT * FROM ?? WHERE ?? = ?';
        const [rows] = await db.execute(sql, ['customer', 'username', username]);
        return rows[0];
    },
    
    
}
module.exports = authDao;