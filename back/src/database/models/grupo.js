'use strict'

module.exports = (sequelize, DataTypes) => {
  const Grupo = sequelize.define('Grupo', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    numero: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(50),
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
    tableName: 'Grupo',
    timestamps: false
  })

  Grupo.associate = models => {
    Grupo.belongsTo(models.Curso, { foreignKey: 'curso_id', allowNull: true })
    // Grupo.hasMany(models.PersonaXGrupo, { foreignKey: 'grupo_id' })
    Grupo.belongsToMany(models.Persona, { through: 'PersonaXGrupo', foreignKey:'grupo_id', otherKey:'persona_id'});
  }

  return Grupo
}
