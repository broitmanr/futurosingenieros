import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Persona from './persona.js';
import Grupo from './grupo.js';

const PersonaXGrupo = sequelize.define('PersonaXGrupo', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  persona_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Persona,
      key: 'ID'
    }
  },
  grupo_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Grupo,
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
  tableName: 'PersonaXGrupo',
  timestamps: false
});

export default PersonaXGrupo;
