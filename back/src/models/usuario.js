import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Persona from './persona.js';

const Usuario = sequelize.define('Usuario', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  mail: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  rol: {
    type: DataTypes.STRING(1),
    allowNull: true
  },
  persona_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: Persona,
      key: 'ID'
    }
  }
}, {
  tableName: 'Usuario',
  timestamps: false
});

export default Usuario;

Usuario.belongsTo(Persona, { foreignKey: 'persona_id' })
Persona.hasOne(Usuario, { foreignKey: 'persona_id' })