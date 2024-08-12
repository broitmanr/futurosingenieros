import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Persona from './persona.js';
import Curso from './curso.js';

const PersonaXCurso = sequelize.define('PersonaXCurso', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  },
  rol: {
    type: DataTypes.STRING(5),
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
  tableName: 'PersonaXCurso',
  timestamps: false
});

export default PersonaXCurso;