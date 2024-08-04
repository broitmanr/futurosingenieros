import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TipoInstancia = sequelize.define('TipoInstancia', {
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
    type: DataTypes.STRING(100),
    allowNull: true
  }
}, {
  tableName: 'TipoInstancia',
  timestamps: false
});

export default TipoInstancia;