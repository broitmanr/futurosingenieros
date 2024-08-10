
'use strict';
import usuario from '../models/usuario.js'
import bcrypt from "bcryptjs";

module.exports = {
    up: function (queryInterface, Sequelize){
        return Promise.all([
            usuario.findOrCreate({
                where:{
                    id:'1'
                },defaults:{
                    mail:'broitmanroman@alu.frlp.utn.edu.ar',
                    persona_id:1,
                    password:bcrypt.hashSync('password')
                }
            })
        ])
    }
}