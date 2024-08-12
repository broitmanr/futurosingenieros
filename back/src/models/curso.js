const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const Materia = require('./materia.js');
const Comision = require('./comision.js');

const Curso = sequelize.define('Curso', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  cicloLectivo: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  materia_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Materia,
      key: 'ID',
    },
  },
  comision_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Comision,
      key: 'ID',
    },
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
  tableName: 'Curso',
  timestamps: false,
});

Curso.belongsTo(Materia, { foreignKey: 'materia_id' });
Curso.belongsTo(Comision, { foreignKey: 'comision_id' });

module.exports = Curso;