// models/DiasEspeciales.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

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
    type: DataTypes.STRING(100),
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  cuentaAsistencia: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  }
}, {
  tableName: 'DiasEspeciales',
  timestamps: false
});

export default DiasEspeciales;
