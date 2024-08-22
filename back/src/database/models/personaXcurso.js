module.exports = (sequelize, DataTypes) => {
  const PersonaXCurso = sequelize.define('PersonaXCurso', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    rol: {
      type: DataTypes.STRING(5),
      allowNull: false
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
    tableName: 'PersonaXCurso',
    timestamps: false,
    freezeTableName: true
  })

  PersonaXCurso.associate = models => {
    PersonaXCurso.belongsTo(models.Persona, {
      foreignKey: {
        name: 'persona_id',
        allowNull: false
      }
    })
    PersonaXCurso.belongsTo(models.Curso, {
      foreignKey: {
        name: 'curso_id',
        allowNull: false
      }
    })
  }
  return PersonaXCurso
}
