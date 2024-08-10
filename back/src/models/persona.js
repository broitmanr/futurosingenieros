import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Persona = sequelize.define('Persona', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  apellido: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  legajo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  dni: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  rol: {
    type: DataTypes.STRING(1),
    allowNull: true
  }
}, {
  tableName: 'Persona',
  timestamps: false
});

export default Persona;
