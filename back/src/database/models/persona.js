module.exports = (sequelize, DataTypes) => {
  const Persona = sequelize.define('Persona', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    legajo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    dni: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true
    },
    rol: {
      type: DataTypes.STRING(1),
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
    tableName: 'Persona',
    timestamps: false
  })

  Persona.associate = models => {
    Persona.hasMany(models.PersonaXCurso, {
      foreignKey: 'persona_id'
    })
    Persona.hasMany(models.InasistenciasPorCurso, {
      foreignKey: 'persona_id'
    })
    Persona.hasOne(models.Usuario, { foreignKey: 'persona_id' })
    Persona.belongsToMany(models.Entrega, { through: 'PersonaXEntrega', foreignKey: 'persona_id', otherKey: 'entrega_id' })
    Persona.belongsToMany(models.Grupo, { through: 'PersonaXGrupo', foreignKey: 'persona_id', otherKey: 'grupo_id' })

  }
  return Persona
}
