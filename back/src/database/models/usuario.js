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

  Usuario.associate = models => {
    Usuario.belongsTo(models.Persona, { foreignKey: 'persona_id', allowNull: true, unique: true });
  };

  return Usuario;
};