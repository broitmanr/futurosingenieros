'use strict'

module.exports = (sequelize, DataTypes) => {
  const DiasEspeciales = sequelize.define('DiasEspeciales', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    cuentaAsistencia: {
      type: DataTypes.BOOLEAN,
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
    tableName: 'DiasEspeciales',
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['fecha', 'descripcion', 'nombre', 'cuentaAsistencia']
      }
    ]
  })
  return DiasEspeciales
}
