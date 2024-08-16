'use strict'


module.exports = (sequelize,DataTypes)=>{
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
    freezeTableName:true,
  });

  Curso.associate = models =>{
    Curso.belongsTo(models.Materia,{foreignKey:'materia_id'})
    Curso.belongsTo(models.Comision,{foreignKey:'comision_id'})
    Curso.hasMany(models.PersonaXCurso,{foreignKey:'curso_id'})
  }


  return Curso
}

