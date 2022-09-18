const Pool = require('pg').Pool

const pool = new Pool({
user: 'postgres',
password: '',
host: '165.227.202.2',
port : 5432,
database : "postgres"
})

module.exports = pool;