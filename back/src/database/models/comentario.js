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
    content: {
      type: DataTypes.JSON,
      allowNull: true
    },
    position: {
      type: DataTypes.JSON,
      allowNull: true
    },
    type: {
      type: DataTypes.STRING(50),
      allowNull: true
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
    Comentario.hasMany(models.Comentario,{foreignKey:'respuesta_id'})
  }
  return Comentario
}
