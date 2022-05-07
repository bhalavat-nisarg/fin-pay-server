const db = require('./connection');

async function createUser(newUser) {
    let result;
    let pool = await db.openPool();
    const sql = `INSERT INTO XXFIN_USERS ( first_name
                                         , last_name
                                         , email
                                         , mobile
                                         , username
                                         , password
                                         , verified
                                         , creation_date
                                         , last_updated_date) 
                                    VALUES  ( :v_fname
                                            , :v_lname
                                            , :v_email
                                            , :v_mobile
                                            , :v_user
                                            , :v_pass
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
        console.log('print result ', result);
        if (result.rowsAffected == 1) {
            return {
                status: 'success',
                message: 'User Created!!',
            };
        }
    } catch (err) {
        console.error('print err', err.message);
        return err.message;
    } finally {
        db.closePool();
    }
}

module.exports = {
    createUser,
};
