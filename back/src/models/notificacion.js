import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import TipoNotificacion from './tipoNotificacion.js';
import Usuario from './Usuario.js';

const Notificacion = sequelize.define('Notificacion', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  tipoNotificacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: TipoNotificacion,
      key: 'ID'
    }
  },
  detalle: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'ID'
    }
  },
  leido: {
    type: DataTypes.BOOLEAN,
    allowNull: true
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
  tableName: 'Notificacion',
  timestamps: false
});

export default Notificacion;