'use strict'

module.exports = (sequelize, DataTypes) => {
  const PersonaXGrupo = sequelize.define('PersonaXGrupo', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
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
    tableName: 'PersonaXGrupo',
    timestamps: false
  })

  PersonaXGrupo.associate = models => {
    PersonaXGrupo.belongsTo(models.Persona, { foreignKey: 'persona_ID', allowNull: false })
    PersonaXGrupo.belongsTo(models.Grupo, { foreignKey: 'grupo_ID', allowNull: false })
  }

  return PersonaXGrupo
}
