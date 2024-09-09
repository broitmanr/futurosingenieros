const { red } = require('picocolors')
const errors = require('./error')
const models = require('../database/models/index')

// Función auxiliar para manejar transacciones y errores
async function handleTransaction (callback, next) {
  const transaction = await models.sequelize.transaction()
  try {
    const result = await callback(transaction)
    await transaction.commit()
    return result
  } catch (error) {
    await transaction.rollback()
    console.error(red('Error en la transacción:', error))
    next({
      ...errors.InternalServerError,
      details: 'Error en la transacción: ' + error.message
    })
  }
}

module.exports = {
  handleTransaction
}
