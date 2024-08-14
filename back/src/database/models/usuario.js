module.exports = (sequelize,DataTypes)=> {
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
      type: DataTypes.STRING(100),
      allowNull: false
    },
    rol: {
      type: DataTypes.STRING(1),
      allowNull: true
    },
    // persona_id: {
    //   type: DataTypes.INTEGER,
    //   allowNull: true,
    //   unique: true,
    //   references: {
    //     model: Persona,
    //     key: 'ID'
    //   }
    // },
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
    tableName: 'Usuario',
    timestamps: false
  });
  return Usuario
}