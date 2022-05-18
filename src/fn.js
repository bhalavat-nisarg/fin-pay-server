const users = require('../utils/users');
const txn = require('../utils/txn');
const transform = require('../utils/transform');
const bcrypt = require('bcrypt');

const saltRounds = 10;

async function registerUser(req, res) {
    console.log('Registering user..');
    const hashPass = await bcrypt.hash(req.body.user.password, saltRounds);
    console.log(hashPass);
    const out = await users.createUser({
        firstName: req.body.user.firstName,
        lastName: req.body.user.lastName,
        username: req.body.user.username,
        password: hashPass,
        email: req.body.user.email,
        mobile: req.body.user.mobile,
        currency: 'INR',
    });
    res.status(out.status).send({ status: out.status, message: out.message });
}

async function loginUser(req, res) {
    const auth = await authentication(req, res);

    if (auth.status != 200) {
        res.status(auth.status).send({
            status: auth.status,
            message: auth.message,
        });
    } else {
        console.log('User logged in');
        res.send({
            status: 200,
            message: 'Welcome back ' + auth.username + '!!',
            userId: auth.userId,
        });
    }
}

async function getUsers(req, res) {
    const id = req.params.id || req.query.userId;
    const username = req.query.username;
    const email = req.query.email;
    const mobile = req.query.mobile;
    const total = req.query.totalResults || false;
    let resp;

    const auth = await authentication(req, res);

    if (auth.status != 200) {
        res.status(auth.status).send({
            status: auth.status,
            message: auth.message,
        });
    } else {
        console.log('Searching user based on query');
        if (username || email || mobile || id) {
            const user = {
                username: username,
                email: email,
                mobile: mobile,
                id: id,
            };
            resp = await users.getUser(user);
            if (total) {
                let cnt = Object.keys(resp).length;
                res.status(200).send({
                    status: 200,
                    totalResults: cnt,
                    items: resp,
                });
            } else {
                res.status(200).send({
                    status: 200,
                    items: resp,
                });
            }
        } else {
            resp = await users.getAllUsers();
            if (total) {
                let cnt = Object.keys(resp).length;
                res.status(200).send({
                    totalResults: cnt,
                    status: 200,
                    items: resp,
                });
            } else {
                res.status(200).send({
                    status: 200,
                    items: resp,
                });
            }
        }
    }
}

async function updateUserDetails(req, res) {
    const id = req.params.id;
    const auth = await authentication(req, res);
    if (auth.status != 200) {
        res.status(auth.status).send({
            status: auth.status,
            message: auth.message,
        });
    } else {
        const user = {
            firstName: req.body.firstName || '#NULL',
            lastName: req.body.lastName || '#NULL',
            email: req.body.email || '#NULL',
            mobile: req.body.mobile || '#NULL',
            id: id,
            username: auth.username,
        };
        console.log('Updating the user details..');

        const resp = await users.updateUser(user);

        if (resp === null) {
            console.log('User details updated!');
            res.send({
                status: 200,
                message: 'User details updated!',
            });
        } else {
            res.status(500).send({
                status: 500,
                message: resp,
            });
        }
    }
}

async function deleteUserAccount(req, res) {
    const user_id = req.params.id;
    const auth = await authentication(req, res);
    if (auth.status != 200) {
        res.status(auth.status).send({
            status: auth.status,
            message: auth.message,
        });
    } else if (auth.userId == user_id) {
        console.log('Deleting the user..');
        const resp = await users.deleteUser(user_id);
        if (resp == undefined) {
            console.log('User deleted!');
            res.status(204).send();
        } else {
            res.status(500).send({
                status: 500,
                message: 'Internal server error..',
            });
        }
    } else {
        res.status(403).send({
            status: 403,
            message: 'Invalid Credentials or User Id.',
        });
    }
}

async function userTransaction(req, res) {
    const targetId = req.body.targetId;
    const sourceId = req.body.sourceId;
    const currency = req.body.currency;
    const gateway = req.body.gateway;
    const amount = req.body.amount;
    const method = req.body.method;
    const mode = req.body.mode;
    const desc = req.body.description;

    const auth = await authentication(req, res);

    const txnObj = {
        targetId,
        sourceId,
        currency,
        gateway,
        amount,
        method,
        mode,
        desc,
    };

    if (auth.status != 200) {
        res.status(auth.status).send({
            status: auth.status,
            message: auth.message,
        });
    } else if (
        !targetId ||
        !sourceId ||
        !currency ||
        !gateway ||
        !amount ||
        !method ||
        !mode
    ) {
        res.status(400).send({
            status: 400,
            message:
                'Mandatory objects not provided to complete the transaction.',
        });
    } else if (
        mode.toUpperCase() == 'DEPOSIT' ||
        mode.toUpperCase() == 'WITHDRAW' ||
        mode.toUpperCase() == 'P2P'
    ) {
        console.log('Amount transfer in progress..');
        //console.log(txnObj);
        const resp = await txn.loadMoney(txnObj);

        if (resp === null) {
            console.log('Amount transfer successful!');
            res.send({
                status: 200,
                message: 'Amount transfer successful!',
            });
        } else {
            console.log('error: ' + resp);
            res.status(403).send({
                status: 403,
                message: resp,
            });
        }
    } else {
        res.status(403).send({
            status: 403,
            message:
                "Invalid value provided for identifier 'Mode'. " +
                'Valid values are DEPOSIT, WITHDRAW, P2P.',
        });
    }
}

async function checkUser(user, pass) {
    //console.log(user, pass);
    console.log('search using user credentials');
    const resp = await users.searchUserAccount(user);
    //console.log(resp);
    const cnt = Object.keys(resp).length;
    if (cnt > 0) {
        const hashPass = resp[0].PASSWORD;
        const validUser = await bcrypt.compare(pass, hashPass);
        //console.log(hashPass, validUser);
        if (validUser) {
            return {
                userId: resp[0].USER_ID,
                firstName: resp[0].FIRST_NAME,
                username: resp[0].USERNAME,
                password: validUser,
            };
        }
    }
    return {
        userId: 0,
        firstName: null,
        username: null,
        password: null,
    };
}

async function authentication(req, res) {
    if (!req.headers.authorization) {
        console.log('No token. User authentication failed!');
        return {
            status: 401,
            message: 'Authentication failed. Please provide a Token!',
        };
    } else {
        const encoded = req.headers.authorization.replace('Basic ', '');
        const auth = transform.decodeToken(encoded);
        const authCred = await checkUser(auth.user, auth.pass);
        if (
            authCred.userId == 0 ||
            auth.user !== authCred.username ||
            !authCred.password
        ) {
            console.log('User authentication failed!');
            return {
                status: 401,
                message:
                    'Authentication failed. Invalid Username or Password!!',
            };
        } else {
            console.log('User Authenticated');
            return {
                status: 200,
                message: 'User Authenticated.',
                userId: authCred.userId,
                username: authCred.username,
            };
        }
    }
}

module.exports = {
    registerUser,
    loginUser,
    getUsers,
    updateUserDetails,
    deleteUserAccount,
    userTransaction,
};
