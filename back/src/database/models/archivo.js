'use strict'

module.exports = (sequelize,DataTypes)=> {
  const Archivo = sequelize.define('Archivo', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    referencia: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    extension: {
      type: DataTypes.STRING(10),
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
    tableName: 'Archivo',
    timestamps: false
  });

  Archivo.associate = models => {
    Archivo.belongsTo(models.Entrega, { foreignKey: 'entrega_id', allowNull: false })
  }

  return Archivo;
}