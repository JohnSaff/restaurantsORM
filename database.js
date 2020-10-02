const{Database} = require ('sqlite3')
module.exports = new Database(':memory:')
