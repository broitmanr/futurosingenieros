'use strict'

module.exports = (sequelize, DataTypes) => {
  const Notificacion = sequelize.define('Notificacion', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    detalle: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    leido: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Notificacion',
    timestamps: false
  })

  Notificacion.associate = models => {
    Notificacion.belongsTo(models.TipoNotificacion, { foreignKey: 'tipoNotificacion_id', allowNull: false })
    Notificacion.belongsTo(models.Usuario, { foreignKey: 'usuario_id', allowNull: false })
  }


  return Notificacion
}
