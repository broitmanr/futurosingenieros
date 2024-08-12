import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import TipoPenalidad from './tipoPenalidad.js';
import PersonaXCurso from './personaXcurso.js';

const Penalidad = sequelize.define('Penalidad', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  personaxcurso_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: PersonaXCurso,
      key: 'ID'
    }
  },
  descripcion: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tipoPenalidad_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TipoPenalidad,
      key: 'ID'
    }
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
  tableName: 'Penalidad',
  timestamps: false
});

export default Penalidad;