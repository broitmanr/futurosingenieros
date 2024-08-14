'use strict'

module.exports = (sequelize,DataTypes)=> {
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
    tableName: 'Comentario',
    timestamps: false
  });
return Comentario
}