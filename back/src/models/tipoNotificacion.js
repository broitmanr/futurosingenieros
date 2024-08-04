import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TipoNotificacion = sequelize.define('TipoNotificacion', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  detalle: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  icono: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'TipoNotificacion',
  timestamps: false
});

export default TipoNotificacion;