'use strict'

module.exports = (sequelize, DataTypes) => {
  const InasistenciasPorCurso = sequelize.define('InasistenciasPorCurso', {
    curso_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    persona_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    total_inasistencias: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'InasistenciasPorCurso',
    timestamps: false, // Normalmente las vistas no tienen timestamps
    underscored: true, // Para seguir la convención de nombrado de Sequelize
  })

  InasistenciasPorCurso.associate = models => {
    InasistenciasPorCurso.belongsTo(models.Persona, { foreignKey: 'persona_id', allowNull: false })
    InasistenciasPorCurso.belongsTo(models.Curso, { foreignKey: 'curso_id', allowNull: false })
  }
  return InasistenciasPorCurso
}
