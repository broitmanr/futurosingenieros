module.exports = (sequelize, DataTypes) => {
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
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_by: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Persona',
    timestamps: false
  })
  return Persona
}
