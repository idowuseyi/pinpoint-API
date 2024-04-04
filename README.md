# pinpoint-API

This is a simple authentication API implemented in Node.js using Express.js framework and MongoDB as the database. The API provides endpoints for user registration, login, email verification, password reset, and forgot password functionality.

## Installation

1. Clone the repository or download the source code:

    ```bash
    git clone <repository-url>
    ```

2. Navigate to the project directory:

    ```bash
    cd pinpoint-API
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Start the server:

    ```bash
    npm start
    ```

## Usage

### Register a User

Endpoint: `POST /register`

Registers a new user with email and password.

Example Request:
```json
POST /register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}
```

### Login

Endpoint: `POST /login`

Logs in a user and returns a JWT token for authentication.

Example Request:
```json
POST /login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}
```

### Verify Email

Endpoint: `GET /verify/:token`

Verifies user's email address using a verification token sent via email.

### Forgot Password

Endpoint: `POST /forgot-password`

Initiates the password reset process by sending a reset link to the user's email.

Example Request:
```json
POST /forgot-password
Content-Type: application/json

{
    "email": "user@example.com"
}
```

### Reset Password

Endpoint: `POST /reset-password/:token`

Resets user's password using the provided reset token.

Example Request:
```json
POST /reset-password/resetToken
Content-Type: application/json

{
    "newPassword": "newpassword"
}
```

## Dependencies

- [Express.js](https://expressjs.com/): Fast, unopinionated, minimalist web framework for Node.js.
- [MongoDB](https://www.mongodb.com/): A document-oriented NoSQL database.
- [Mongoose](https://mongoosejs.com/): An Object Data Modeling (ODM) library for MongoDB and Node.js.
- [bcryptjs](https://www.npmjs.com/package/bcryptjs): Library to hash passwords.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): Library to generate JWT tokens for authentication.
- [nodemailer](https://nodemailer.com/): Library to send emails for verification and password reset.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
