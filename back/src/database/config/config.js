const host = process.env.DB_HOST
// const port = process.env.DB_PORT
const database = process.env.DB_NAME
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD

module.exports = {
  development: {
    username: user,
    password,
    database,
    host,
    dialect: 'mysql'
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'mysql'
  },
  production: {
    username: 'root',
    password: null,
    database: 'database_production',
    host: '127.0.0.1',
    dialect: 'mysql'
  }
}
