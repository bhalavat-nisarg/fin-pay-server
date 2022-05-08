const db = require('./connection');

async function createUser(newUser) {
    let result;
    let pool;
    const poolStatus = await db.checkPoolStatus();
    if (poolStatus > 6000) {
        pool = await db.openPool();
    } else {
        pool = db.getPool();
    }

    const sql = `INSERT INTO XXFIN_USERS ( first_name
                                         , last_name
                                         , email
                                         , mobile
                                         , username
                                         , password
                                         , verified
                                         , creation_date
                                         , last_updated_date) 
                                    VALUES  ( TRIM(:v_fname)
                                            , TRIM(:v_lname)
                                            , TRIM(:v_email)
                                            , TRIM(:v_mobile)
                                            , TRIM(:v_user)
                                            , TRIM(:v_pass)
                                            , 'N'
                                            , SYSDATE
                                            , SYSDATE)`;
    const bind = [
        newUser.firstName,
        newUser.lastName,
        newUser.email,
        newUser.mobile,
        newUser.username,
        newUser.password,
    ];
    try {
        result = await db.openConnection(pool, sql, bind);
        if (result.rowsAffected == 1) {
            return {
                status: 'success',
                message: 'User Created!!',
            };
        }
    } catch (err) {
        let response, userMsg, emailMsg, mobileMsg, accMsg;
        console.error('print err', err, err.message);
        userMsg = err.message.includes('USERNAME');
        emailMsg = err.message.includes('EMAIL');
        mobileMsg = err.message.includes('MOBILE');
        accMsg = err.message.includes('ACCOUNT');
        if (err.errorNum == 1 && userMsg) {
            response = {
                status: 'failed',
                message: 'Username is already in use!',
            };
        } else if (err.errorNum == 1 && emailMsg) {
            response = {
                status: 'failed',
                message: 'Email ID is already in use!',
            };
        } else if (err.errorNum == 1 && mobileMsg) {
            response = {
                status: 'failed',
                message: 'Mobile No is already in use!',
            };
        } else if (err.errorNum == 1 && mobileMsg) {
            response = {
                status: 'failed',
                message: 'An account already exists with these details!',
            };
        } else {
            response = err.message;
        }
        return response;
    }
}

async function getAllUsers() {
    let result;
    let pool;
    const poolStatus = await db.checkPoolStatus();
    if (poolStatus > 6000) {
        pool = await db.openPool();
    } else {
        pool = db.getPool();
    }

    const sql = `SELECT XFU.first_name
                      , XFU.last_name
                      , XFU.username
                      , XFU.email
                      , XFU.mobile
                      , XFU.verified
                      , XFU.mobile_verified
                      , XFU.email_verified
                      , TO_CHAR(XFU.creation_date, 'Mon-YYYY', 'NLS_DATE_LANGUAGE=ENGLISH') MEMBER_SINCE
                      , TO_CHAR(XFU.last_updated_date, 'DD-Mon-YYYY', 'NLS_DATE_LANGUAGE=ENGLISH') LAST_UPDATE
                   FROM xxfin_users XFU
                  ORDER BY TRUNC(XFU.creation_date) DESC`;
    const bind = [];

    try {
        result = await db.openConnection(pool, sql, bind);
        return result.rows;
    } catch (err) {
        console.error(err, err.message);
    }
}

async function getUser(user) {
    let result;
    let pool;
    const poolStatus = await db.checkPoolStatus();
    if (poolStatus > 6000) {
        pool = await db.openPool();
    } else {
        pool = db.getPool();
    }

    const sql = `SELECT XFU.user_id
                      , XFU.first_name
                      , XFU.last_name
                      , XFU.username
                      , XFU.email
                      , XFU.mobile
                      , XFU.verified
                      , XFU.mobile_verified
                      , XFU.email_verified
                      , TO_CHAR(XFU.creation_date, 'Mon-YYYY', 'NLS_DATE_LANGUAGE=ENGLISH') MEMBER_SINCE
                      , TO_CHAR(XFU.last_updated_date, 'DD-Mon-YYYY', 'NLS_DATE_LANGUAGE=ENGLISH') LAST_UPDATE
                   FROM xxfin_users XFU
                  WHERE (   XFU.user_id = TRIM(:1) 
                         OR UPPER(XFU.username) = UPPER(TRIM(:2))
                         OR UPPER(XFU.email) = UPPER(TRIM(:3))
                         OR XFU.mobile = TRIM(:4)
                        )`;
    const bind = [user.id, user.username, user.email, user.mobile];

    try {
        result = await db.openConnection(pool, sql, bind);
        return result.rows;
    } catch (err) {
        console.error(err, err.message);
    }
}

async function searchUserAccount(username, password) {
    let result;
    let pool;
    const poolStatus = await db.checkPoolStatus();
    if (poolStatus > 6000) {
        pool = await db.openPool();
    } else {
        pool = db.getPool();
    }

    const sql = `SELECT XFU.user_id
                      , XFU.first_name
                      , XFU.username
                      , XFU.password
                   FROM xxfin_users XFU
                  WHERE UPPER(XFU.username) = UPPER(TRIM(:1))
                    AND XFU.password = TRIM(:2)`;
    const bind = [username, password];

    try {
        result = await db.openConnection(pool, sql, bind);
        return result.rows;
    } catch (err) {
        console.log(err, err.message);
    }
}

module.exports = {
    createUser,
    getAllUsers,
    getUser,
    searchUserAccount,
};
