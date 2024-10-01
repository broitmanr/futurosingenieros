'use strict'

module.exports = (sequelize, DataTypes) => {
  const EntregaPactada = sequelize.define('EntregaPactada', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fechavto1: {
      type: DataTypes.DATE,
      allowNull: false
    },
    fechavto2: {
      type: DataTypes.DATE,
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
    tableName: 'EntregaPactada',
    timestamps: false
  })

  EntregaPactada.associate = models => {
    EntregaPactada.belongsTo(models.InstanciaEvaluativa, { foreignKey: 'instanciaEvaluativa_id', allowNull: false })
    EntregaPactada.hasMany(models.Entrega, { foreignKey: 'entregaPactada_ID' })
  }
  return EntregaPactada
}
