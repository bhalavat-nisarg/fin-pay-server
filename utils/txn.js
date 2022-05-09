const db = require('./connection');

async function loadMoney(txnObj) {
    let result;
    let pool;
    const poolStatus = await db.checkPoolStatus();
    if (poolStatus === db.poolStatus.poolClosed) {
        pool = await db.openPool();
    } else {
        pool = db.getPool();
    }

    const sql = ``;
}

module.exports = {
    loadMoney,
};
