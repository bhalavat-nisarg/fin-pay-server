const { Pool } = require('pg');
const dbConfig = require('./dbConfig');

async function openPool() {
    try {
        const pool = new Pool({
            host: dbConfig.postgres.host,
            port: dbConfig.postgres.port,
            user: dbConfig.postgres.username,
            password: dbConfig.postgres.password,
            database: dbConfig.postgres.database,
        });

        console.log('Connection pool started for MySQL');

        return pool;
    } catch (err) {
        console.error('init() error for Postgres: ' + err.message);
    }
}

// TODO: add open connection and close pool
