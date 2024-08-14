'use strict'

module.exports = (sequelize,DataTypes)=> {
  const InstanciaEvaluativa = sequelize.define('InstanciaEvaluativa', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    porcentaje_ponderacion: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    tableName: 'InstanciaEvaluativa',
    timestamps: false
  });

  InstanciaEvaluativa.associate = models => {
    InstanciaEvaluativa.belongsTo(models.Curso, { foreignKey: 'curso_id', allowNull: false })
    InstanciaEvaluativa.belongsTo(models.TipoInstancia, { foreignKey: 'tipoInstancia_id', allowNull: false })
  }

  return InstanciaEvaluativa
}