const mysql = require('mysql');
const dbConfig = require('./dbConfig');

async function openPool() {
    try {
        const pool = await mysql.createPool({
            host: dbConfig.mysql.host,
            port: dbConfig.mysql.port,
            user: dbConfig.mysql.username,
            password: dbConfig.mysql.password,
            database: dbConfig.mysql.database,
            connectionLimit: 10,
            debug: false,
        });
        console.log('Connection pool started for MySQL');

        return pool;
    } catch (err) {
        console.error('init() error for MySql: ' + err.message);
    }
}

async function openConnection(pool, Query) {
    let connection, sql, result;

    console.log('Connection started');

    try {
        connection = await pool.getConnection();
        if (Query == null) {
            sql = `SELECT sysdate FROM dual`;
        } else {
            sql = Query;
        }
        result = await connection.query(sql);
        return result;
    } catch (err) {
        throw err;
    }
}

async function closePool(pool) {
    try {
        console.log('Closing Pool for MySql!');
        await pool.end();
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    } finally {
        console.log('\nTerminating...');
        process.exit(0);
    }
}

module.exports = {
    openPool,
    openConnection,
    closePool,
};
