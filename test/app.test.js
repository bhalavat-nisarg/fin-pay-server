const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const express = require('express');

test('Express routes start and preserve request and fallback behavior', async (t) => {
    const app = express();
    app.listen = () => {};
    const handlers = [
        'registerUser', 'loginUser', 'enable2FAfn', 'verify2FAfn',
        'updateUserDetails', 'delete2FAfn', 'deleteUserAccount',
        'getUsers', 'userTransaction', 'serverCheck',
    ];
    const fn = Object.fromEntries(handlers.map((name) => [
        name,
        (req, res) => res.json({ handler: name, body: req.body }),
    ]));
    const dependencies = {
        express: Object.assign(() => app, express),
        './fn': fn,
        '../utils/oci': {},
        'express-rate-limit': require('express-rate-limit'),
        '../utils/env': { PORT: 0, APP_MODE: 1 },
        '../utils/mongo': {},
        '../utils/mongoFn': {},
    };
    vm.runInNewContext(
        readFileSync(path.join(__dirname, '..', 'src', 'app.js'), 'utf8'),
        {
            require(name) {
                assert.ok(Object.hasOwn(dependencies, name), `Unexpected import: ${name}`);
                return dependencies[name];
            },
        },
        { filename: 'app.js' },
    );

    const server = http.createServer(app);
    t.after(() => new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    }));
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });
    const baseUrl = `http://127.0.0.1:${server.address().port}`;

    const health = await fetch(`${baseUrl}/api`);
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { handler: 'serverCheck', body: {} });

    const login = await fetch(`${baseUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '123456' }),
    });
    assert.equal(login.status, 200);
    assert.deepEqual(await login.json(), {
        handler: 'loginUser', body: { token: '123456' },
    });

    for (const [method, route] of [
        ['GET', '/'], ['GET', '/missing/nested'], ['PUT', '/api'],
    ]) {
        const response = await fetch(`${baseUrl}${route}`, { method });
        assert.equal(response.status, 405);
        assert.deepEqual(await response.json(), {
            status: 405, message: 'Method not allowed',
        });
    }
});
