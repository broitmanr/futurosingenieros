'use strict'

module.exports = (sequelize, DataTypes) => {
  const PersonaXEntrega = sequelize.define('PersonaXEntrega', {
    pocentaje_participacion: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'PersonaXEntrega',
    timestamps: false
  })

  PersonaXEntrega.associate = models => {
    PersonaXEntrega.belongsTo(models.Persona, { foreignKey: 'persona_id', allowNull: false })
    PersonaXEntrega.belongsTo(models.Entrega, { foreignKey: 'entrega_id', allowNull: false })
  }

  return PersonaXEntrega
}
