'use strict'

module.exports = (sequelize, DataTypes) => {
  const Penalidad = sequelize.define('Penalidad', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    descripcion: {
      type: DataTypes.STRING(100),
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
    tableName: 'Penalidad',
    timestamps: false
  })

  Penalidad.associate = models => {
    Penalidad.belongsTo(models.PersonaXCurso, { foreignKey: 'personaxcurso_id', allowNull: false })
    Penalidad.belongsTo(models.TipoPenalidad, { foreignKey: 'tipoPenalidad_id', allowNull: false })
  }

  return Penalidad
}
