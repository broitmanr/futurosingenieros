import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Curso from './curso.js';
import TipoInstancia from './tipoInstancia.js';

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
  curso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Curso,
      key: 'ID'
    }
  },
  tipoInstancia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TipoInstancia,
      key: 'ID'
    }
  },
  porcentaje_ponderacion: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'InstanciaEvaluativa',
  timestamps: false
});

export default InstanciaEvaluativa