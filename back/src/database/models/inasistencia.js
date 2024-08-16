'use strict';

module.exports = (sequelize, DataTypes) => {
  const Inasistencia = sequelize.define('Inasistencia', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true,
    }
  }, {
    tableName: 'Inasistencia',
    timestamps: false
  });

  Inasistencia.associate = models => {
    Inasistencia.belongsTo(models.Persona, { foreignKey: 'persona_id', allowNull: false })
    Inasistencia.belongsTo(models.Curso, { foreignKey: 'curso_id', allowNull: false })
  }
  return Inasistencia
}