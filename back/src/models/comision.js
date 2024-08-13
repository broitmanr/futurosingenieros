import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
  tableName: 'Comision',
  timestamps: false,
});

export default Comision