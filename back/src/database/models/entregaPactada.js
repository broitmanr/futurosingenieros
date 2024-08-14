'use strict'

module.exports = (sequelize,DataTypes)=> {
const EntregaPactada = sequelize.define('EntregaPactada', {
  ID: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  numero: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  fechavto1: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fechavto2: {
    type: DataTypes.DATE,
    allowNull: true
  },
  instanciaEvaluativa_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: InstanciaEvaluativa,
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
  tableName: 'EntregaPactada',
  timestamps: false
});
return EntregaPactada
}