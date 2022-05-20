const express = require('express');
const fn = require('./fn');
const os = require('os');
const oci = require('../utils/oci');

if (os.platform == 'win32') {
    const dotenv = require('dotenv').config();
}

const app = express();
const port = process.env.PORT || 3000;

// TODO: Log events of login, signup, and delete user

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('title', 'FinPay Server');

app.post('/api/signup', fn.registerUser);
app.post('/api/login', fn.loginUser);

app.get('/api/users/:id', fn.getUsers);
app.get('/api/users', fn.getUsers);
app.patch('/api/users/:id', fn.updateUserDetails);
app.delete('/api/users/:id', fn.deleteUserAccount);

app.post('/api/txn/exchange', fn.userTransaction);

app.all('*', (req, res) => {
    res.status(405).send({ status: 405, message: 'Method not allowed' });
});

app.listen(port, async () => {
    console.log('Server running on port: ' + port);
    await oci.loadConfigFile();
    fn.getAppStatus();
});
