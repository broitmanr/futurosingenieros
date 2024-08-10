import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Materia = sequelize.define('Materia', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  anio: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'Materia',
  timestamps: false
});

export default Materia;
