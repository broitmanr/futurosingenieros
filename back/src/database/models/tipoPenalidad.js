'use strict'

module.exports = (sequelize,DataTypes)=> {
  const TipoPenalidad = sequelize.define('TipoPenalidad', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    descripcion: {
      type: DataTypes.STRING(300),
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
    tableName: 'TipoPenalidad',
    timestamps: false
  });
return TipoPenalidad
}
