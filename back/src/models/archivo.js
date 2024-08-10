// models/Archivo.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Entrega from './entrega.js';

const Archivo = sequelize.define('Archivo', {
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
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  referencia: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  extension: {
    type: DataTypes.STRING(10),
    allowNull: true
  }
}, {
  tableName: 'Archivo',
  timestamps: false
});

export default Archivo;