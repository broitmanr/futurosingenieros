
module.exports = (sequelize,DataTypes)=> {
  const Materia = sequelize.define('Materia', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
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
    tableName: 'Materia',
    timestamps: false,
    freezeTableName: true
  });

  Materia.associate = models =>{
    Materia.hasMany(models.Curso,{foreignKey:'materia_id'})
  }


  return Materia
}
