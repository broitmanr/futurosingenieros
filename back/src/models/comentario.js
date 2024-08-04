// models/Comentario.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Entrega from './entrega.js';
import Persona from './persona.js';

const Comentario = sequelize.define('Comentario', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  entrega_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Entrega,
      key: 'ID'
    }
  },
  comentario: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  emisor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Persona,
      key: 'ID'
    }
  },
  personaXentrega_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'Comentario',
  timestamps: false
});

export default Comentario