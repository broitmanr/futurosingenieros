'use strict'
const { v4: uuidv4 } = require('uuid')

module.exports = (sequelize, DataTypes) => {
  const Archivo = sequelize.define('Archivo', {
    ID: {
      type: DataTypes.UUID,
      defaultValue: uuidv4,
      primaryKey: true,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    referencia: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    extension: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Archivo',
    timestamps: false
  })

  Archivo.associate = models => {
    Archivo.belongsTo(models.Entrega, { foreignKey: 'entrega_id', allowNull: true }),
    Archivo.belongsTo(models.Curso, { foreignKey: 'curso_id', allowNull: true })
  }

  return Archivo
}
