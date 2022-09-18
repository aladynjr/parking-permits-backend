const Pool = require('pg').Pool

const pool = new Pool({
user: 'postgres',
password: '',
host: '137.184.73.151',
port : 5432,
database : "postgres"
})

module.exports = pool;