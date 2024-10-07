'use strict'

module.exports = (sequelize, DataTypes) => {
  const Entrega = sequelize.define('Entrega', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nota: {
      type: DataTypes.INTEGER,
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
    tableName: 'Entrega',
    timestamps: false
  })

  Entrega.associate = models => {
    Entrega.belongsTo(models.Grupo, { foreignKey: 'grupo_ID', allowNull: true })
    Entrega.belongsTo(models.EntregaPactada, { foreignKey: 'entregaPactada_ID', allowNull: false })
    Entrega.belongsTo(models.Persona, { foreignKey: 'persona_id', allowNull: true })
  }

  return Entrega
}
