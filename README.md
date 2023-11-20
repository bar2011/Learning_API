<h1 align="center">Welcome to Learning-API 👋</h1>
<p>
  <img alt="Version" src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="#" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" />
  </a>
</p>

## Install

```sh
npm install
```

After installing packages, you will need to create a MySQL database by running the `.sql` file inside the database folder.

Create a user with the privileges to `SELECT`, `INSERT`, `DELETE` and `UPDATE`, and save the username and the password.

Create a .env file in the root directory, which should look like the following:
```
USER=[sql user username]
PASSWORD=[sql user password]
JWT_SECRET=[secret key to encrypt JSON web tokens (similair to session IDs)]
```
[More information about JSON web tokens (JWT)](https://jwt.io)

## Usage

```sh
npm run start
```
[Create your own courses](/courses.md)

## Author

👤 **Bar Einav**

* Github: [@bar2011](https://github.com/bar2011)

## Show your support

Give a ⭐️ if this project helped you!

***