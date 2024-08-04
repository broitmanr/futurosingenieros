import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const TipoPenalidad = sequelize.define('TipoPenalidad', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  descripcion: {
    type: DataTypes.STRING(300),
    allowNull: false
  }
}, {
  tableName: 'TipoPenalidad',
  timestamps: false
});

export default TipoPenalidad;
