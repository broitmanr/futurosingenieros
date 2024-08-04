const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Comision = sequelize.define('Comision', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nombre: {
    type: DataTypes.STRING(10),
    allowNull: false,
  },
  anio: {
    type: DataTypes.STRING(45),
    allowNull: true,
    defaultValue: 'anio estipulado ejemplo: S21 -> 2',
  },
}, {
  tableName: 'Comision',
  timestamps: false,
});

module.exports = Comision;