'use strict'

module.exports = (sequelize,DataTypes)=> {
  const Comentario = sequelize.define('Comentario', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    comentario: {
      type: DataTypes.STRING(500),
      allowNull: false
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

  Comentario.associate = models => {
    Comentario.belongsTo(models.Entrega, { foreignKey: 'entrega_id', allowNull: false })
    Comentario.belongsTo(models.Persona, { foreignKey: 'emisor_id', allowNull: false })
  }
  return Comentario;
}