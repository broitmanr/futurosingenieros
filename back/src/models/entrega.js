import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Grupo from './grupo.js';
import EntregaPactada from './entregaPactada.js';
import Persona from './persona.js';

const Entrega = sequelize.define('Entrega', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  grupo_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Grupo,
      key: 'ID'
    }
  },
  entregaPactada_ID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: EntregaPactada,
      key: 'ID'
    }
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false
  },
  nota: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  persona_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: Persona,
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
  tableName: 'Entrega',
  timestamps: false
});

export default Entrega;