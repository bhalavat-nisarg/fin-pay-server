const express = require('express');
const db = require('../utils/connection');
const users = require('../utils/users');

if (process.platform == 'win32') {
    const dotenv = require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

let pool;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('title', 'FinPay Server');

app.post('/api/signup', async (req, res) => {
    const out = await users.createUser({
        firstName: req.body.user.firstName,
        lastName: req.body.user.lastName,
        username: req.body.user.username,
        password: encodeText(encodeText(req.body.user.password)),
        email: req.body.user.email,
        mobile: req.body.user.mobile,
    });
    res.send({ status: out.status, message: out.message });
});

app.post('/api/login', async (req, res) => {
    const auth_usr = process.env.API_USER;
    const auth_pwd = process.env.API_PASS;

    if (!req.headers.authorization) {
        res.status(401).send({
            status: 401,
            message: 'Authentication failed. Please provide a Token!',
        });
    } else {
        let encoded = req.headers.authorization.replace('Basic ', '');
        let auth = decodeToken(encoded);
        if (auth.user !== auth_usr || auth.pass !== auth_pwd) {
            res.status(401).send({
                status: 401,
                message:
                    'Authentication failed. Invalid Username or Password!!',
            });
        } else {
            const resp = await checkUser(auth_usr, auth_pwd);
            res.send({
                status: 200,
                message: 'User found!',
                items: {
                    userId: resp.userId,
                    firstName: resp.firstName,
                    username: resp.username,
                },
            });
        }
    }
});

app.get('/api/users/:id', getUsers);

app.get('/api/users', getUsers);

app.delete('/api/users/:id', async (req, res) => {});

app.all('*', (req, res) => {
    res.status(500).send({ status: 500, message: 'Method not allowed' });
});

app.listen(port, async () => {
    console.log('Server running on port: ' + port);
    await db.initializeDB();
    await db.openPool();
    // await db.openConnection(pool);
    // await db.closePool();
});

//process.once('SIGINT', dbConn.closePool()).once('SIGTERM', dbConn.closePool());

function decodeToken(token) {
    let buff = new Buffer.from(token, 'base64');
    let decoded = buff.toString('ascii');
    let arr = decoded.split(':');
    let user = arr[0];
    let pass = encodeText(encodeText(arr[1]));
    return { user, pass };
}

function encodeText(inputText) {
    return Buffer.from(inputText, 'utf-8').toString('base64');
}

function decodeText(inputText) {
    return Buffer.from(inputText, 'base64').toString('ascii');
}

async function getUsers(req, res) {
    let id = req.params.id || req.query.userId;
    let username = req.query.username;
    let email = req.query.email;
    let mobile = req.query.mobile;
    let total = req.query.totalResults || false;
    let resp;

    const auth = await authentication(req, res);

    if (auth.status != 200) {
        res.status(auth.status).send({
            status: auth.status,
            message: auth.message,
        });
    } else {
        if (username || email || mobile || id) {
            const user = {
                username,
                email,
                mobile,
                id,
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

async function authentication(req, res) {
    if (!req.headers.authorization) {
        return {
            status: 401,
            message: 'Authentication failed. Please provide a Token!',
        };
    } else {
        const encoded = req.headers.authorization.replace('Basic ', '');
        const auth = decodeToken(encoded);
        const authCred = await checkUser(auth.user, auth.pass);
        if (
            authCred.userId == 0 ||
            auth.user !== authCred.username ||
            auth.pass !== authCred.password
        ) {
            return {
                status: 401,
                message:
                    'Authentication failed. Invalid Username or Password!!',
            };
        } else {
            return {
                status: 200,
                message: 'User Authenticated.',
            };
        }
    }
}

async function checkUser(user, pass) {
    const resp = await users.searchUserAccount(user, pass);
    const cnt = Object.keys(resp).length;
    if (cnt > 0) {
        return {
            userId: resp[0].USER_ID,
            firstName: resp[0].FIRST_NAME,
            username: resp[0].USERNAME,
            password: resp[0].PASSWORD,
        };
    } else {
        return {
            userId: 0,
            firstName: null,
            username: null,
            password: null,
        };
    }
}
