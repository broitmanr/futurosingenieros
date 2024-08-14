'use strict'

module.exports = (sequelize,DataTypes)=> {
  const PersonaXGrupo = sequelize.define('PersonaXGrupo', {
    ID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    persona_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Persona,
        key: 'ID'
      }
    },
    grupo_ID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Grupo,
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
    tableName: 'PersonaXGrupo',
    timestamps: false
  });
return PersonaXGrupo
}
