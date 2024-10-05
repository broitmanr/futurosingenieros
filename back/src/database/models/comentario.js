'use strict'

module.exports = (sequelize, DataTypes) => {
  const Comentario = sequelize.define('Comentario', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    comentario: {
      type: DataTypes.STRING,
      allowNull: true
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    content: {
      type: DataTypes.JSON,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue:DataTypes.NOW
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
    tableName: 'Comentario',
    timestamps: false
  })

  Comentario.associate = models => {
    Comentario.belongsTo(models.Entrega, { foreignKey: 'entrega_id', allowNull: false })
    Comentario.belongsTo(models.Persona, { foreignKey: 'emisor_id', allowNull: false })
    Comentario.belongsTo(models.Archivo, { foreignKey: 'archivo_id', allowNull: false })
  }
  return Comentario
}
