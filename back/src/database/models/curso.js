'use strict'

module.exports = (sequelize, DataTypes) => {
  const Curso = sequelize.define('Curso', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    cicloLectivo: {
      type: DataTypes.INTEGER,
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
    },
    codigoVinculacion: {
      type: DataTypes.STRING(8),
      unique: true,
      allowNull: true
    }
  }, {
    tableName: 'Curso',
    timestamps: false,
    freezeTableName: true
  })

  Curso.associate = models => {
    Curso.belongsTo(models.Materia, { foreignKey: 'materia_id' })
    Curso.belongsTo(models.Comision, { foreignKey: 'comision_id' })
    Curso.hasMany(models.PersonaXCurso, { foreignKey: 'curso_id' })
    Curso.hasMany(models.InstanciaEvaluativa, { foreignKey: 'curso_id' })
    Curso.belongsToMany(models.Persona, { through: 'PersonaXCurso', foreignKey: 'curso_id', otherKey: 'persona_id' })
  }

  Curso.prototype.esDocente = async function (docenteId) {
    // Buscar en PersonaXCurso si hay un registro con el curso_id actual y el docenteId
    const personaXCurso = await sequelize.models.PersonaXCurso.findOne({
      where: {
        curso_id: this.ID,
        persona_id: docenteId,
        rol: 'D'
      }
    })
    return personaXCurso !== null
  }

  return Curso
}
