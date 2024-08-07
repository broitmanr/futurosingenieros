import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Grupo = sequelize.define('Grupo', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Curso',
      key: 'ID'
    }
  }
}, {
  tableName: 'Grupo',
  timestamps: false
});

export default Grupo;