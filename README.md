# FinPay Server

This is the server-side application for FinPay mobile app.

## Basic Functionalities

1. Creation of User account
2. Fetch User details
3. Updating of User details
4. Delete User account
5. Deposit money
6. Withdraw money
7. Peer-to-Peer (P2P) transfer

---

## Requirements

To run this application on your location system, the following installations are needed:

1. Node.Js
2. NPM Module
3. Oracle DB
4. Oracle Home (Instant Client or Oracle XE)

---

## API Endpoints

URL: `http://(localhost):(port)/api`

### GET Method

> {URL}/users/:id

**Description:** This request will fetch the user from the Database where `:id` matches with unique auto-generated user id.

**Authorization:** Basic Auth (Username & Password)

> {URL}/users

**Description:** This request will fetch the user from the Database where query matches with the registered user.

**Authorization:** Basic Auth (Username & Password)

**Query Parameters:**

| Key         | Value                | Description            |
| ----------- | -------------------- | ---------------------- |
| id          | 15                   | user's unique user id  |
| username    | user52               | registered username    |
| email       | dummy15@invalid.com  | registered email id    |
| mobile      | 5255555555           | registered mobile no   |
| totalResults| True                 | total count of records |

**Response Sample:**
<pre>
{
    "status": 200,
    "totalResults": 1,
    "items": [
        {
            "USER_ID": 15,
            "FIRST_NAME": "user15",
            "LAST_NAME": "52",
            "USERNAME": "user52",
            "EMAIL": "dummy15@invalid.com",
            "MOBILE": "5255555555",
            "VERIFIED": "N",
            "MOBILE_VERIFIED": "N",
            "EMAIL_VERIFIED": "N",
            "MEMBER_SINCE": "May-2022",
            "LAST_UPDATE": "09-May-2022"
        }
    ]
}
</pre>

### POST Method

> {URL}/login

**Description:** The user can login to their account using the request.

**Authorization:** Basic Auth (Username & Password)

**Request Sample:**
<pre>
{}
</pre>

**Response Sample:**
<pre>
{
    "status": 200,
    "message": "Welcome back user52!!",
    "userId": 15
}
</pre>

> {URL}/signup

**Description:** New users can register themselves by creating an account

**Authorization:** None

**Request Sample:**
<pre>
{
    "user": {
        "firstName": "user",
        "lastName": "11",
        "username": "user11",
        "password": "password",
        "email": "dummy11@invalid.com",
        "mobile": 4116543110
    }
}
</pre>

**Response Sample:**
<pre>
{
    "status": 201,
    "message": "User Created!!"
    "userId": 15
}
</pre>

> {URL}/txn/exchange

**Description:** This endpoint is used for transferring money between accounts. Default currency is INR. There are 3 Modes:

1. **Deposit:** Deposit money from third-party account to this account. Minimum amount is INR 100.
2. **Withdraw:** Withdraw money this account to third-party account.
3. **P2P:** Peer-to-Peer money transfer. The sender has to pay 2% commission on each transaction.

**Authorization:** Basic Auth (Username & Password)

**Request Sample:** Deposit/Withdraw
<pre>
{
    "sourceId": 15,
    "targetId": 15,
    "currency": "INR",
    "amount": 105,
    "mode": "deposit",
    "method": "card",
    "gateway": "default",
    "description": "sample txn"
}
</pre>

**Request Sample:** P2P
<pre>
{
    "sourceId": 15,
    "targetId": 25,
    "currency": "INR",
    "amount": 100,
    "mode": "p2p",
    "method": "default",
    "gateway": "default",
    "description": "sample txn 2"
}
</pre>

**Response Sample:**
<pre>
{
    "status": 200,
    "message": "Amount transfer successful!"
}
</pre>

### PATCH Method

> {URL}/users/:id

**Description:** The user can update their account details except Username. Here, `:id` matches with unique auto-generated user id to update the user details. Each user can only update their own details.

**Authorization:** Basic Auth (Username & Password)

**Request Sample:**
<pre>
{
    "lastName": "52",
    "mobile": 5255555555
}
</pre>

**Response Sample:**
<pre>
{
    "status": 200,
    "message": "User details updated!"
}
</pre>

## DELETE Method

> {URL}/users/:id

**Description:** The user can delete their user account. Here, `:id` is the auto-generated unique id. The details of user account should match with their authorization details. Each user can delete only their own account. Once the account is deleted, HTTP status code of `204` means the deletion was successful.

**Authorization:** Basic Auth (Username & Password)
