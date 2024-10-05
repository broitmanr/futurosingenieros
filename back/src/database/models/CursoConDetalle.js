'use strict'

module.exports = (sequelize, DataTypes) => {
  const CursoConDetalle = sequelize.define('CursoConDetalle', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    cicloLectivo: {
      type: DataTypes.STRING,
    },
    codigoVinculacion: {
      type: DataTypes.STRING,
    },
    cantidad_instancias_evaluativas: {
      type: DataTypes.INTEGER,
    },
    totalPonderacion: {
      type: DataTypes.INTEGER,
      field:'suma_porcentajes_ponderacion'
    },
    clases_por_semana: {
      type: DataTypes.INTEGER,
    },
    cantidad_faltas_maxima: {
      type: DataTypes.INTEGER,
    },
  }, {
    tableName: 'CursoConDetalle',
    timestamps: false, // Normalmente las vistas no tienen timestamps
    // underscored: true // Para seguir la convención de nombrado de Sequelize
  })

  CursoConDetalle.associate = models => {
    CursoConDetalle.belongsTo(models.Materia, { foreignKey: 'materia_id', allowNull: false })
    CursoConDetalle.belongsTo(models.Comision, { foreignKey: 'comision_id', allowNull: false })
    CursoConDetalle.hasMany(models.PersonaXCurso, { foreignKey: 'curso_id' })

  }

  return CursoConDetalle
}
