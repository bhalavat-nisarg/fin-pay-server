const express = require('express');
const dbConn = require('../utils/connection');

if (process.platform == 'win32') {
    const dotenv = require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('title', 'FinPay Server');

app.post('/api/signup', (req, res) => {});

app.post('/api/login', (req, res) => {
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
            // const collection = await connectDB();
            // const findResult = await collection.find().toArray();
            // await closeDB();
            // res.status(200).send(findResult);
            res.send({
                user: auth_usr,
                pass: auth_pwd,
            });
        }
    }
});

app.get('/api/users/:id', (req, res) => {
    console.log(req.params.id);
    res.send(req.params.id);
});

app.all('*', (req, res) => {
    res.status(500).send({ status: 500, message: 'Method not allowed' });
});

app.listen(port, async () => {
    console.log('Server running on port: ' + port);
    let pool = await dbConn.openPool();
    await dbConn.openConnection(pool);
    await dbConn.closePool();
});

function decodeToken(token) {
    let buff = new Buffer.from(token, 'base64');
    let decoded = buff.toString('ascii');
    let arr = decoded.split(':');
    let user = arr[0];
    let pass = arr[1];
    return { user, pass };
}

function encodeText(inputText) {
    return Buffer.from(inputText, 'utf-8').toString('base64');
}

function decodeText(inputText) {
    return Buffer.from(token, 'base64').toString('ascii');
}
