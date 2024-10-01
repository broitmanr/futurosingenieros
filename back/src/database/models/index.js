const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const process = require('process')
const basename = path.basename(__filename)

const db = {}

// Inicializar Sequelize
const host = process.env.DB_HOST
const port = process.env.DB_PORT
const database = process.env.DB_NAME
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD

const sequelize = new Sequelize(database, user, password, {
  host,
  dialect: 'mysql',
  port,
  logging: true
})

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
                file !== basename &&
                file.slice(-3) === '.js' &&
                file.indexOf('.test.js') === -1
    )
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  })

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db)
  }
})

// Agregar Sequelize y Sequelize al objeto db
db.sequelize = sequelize
db.Sequelize = Sequelize

// Sincronizar con la base de datos
sequelize.sync()

module.exports = db
