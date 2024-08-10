import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Persona from './persona.js';
import Curso from './curso.js';

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
  persona_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Persona,
      key: 'ID'
    }
  },
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Curso,
      key: 'ID'
    }
  }
}, {
  tableName: 'Inasistencia',
  timestamps: false
});

export default Inasistencia;