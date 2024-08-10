import usuario from "../models/usuario.js";
import bcrypt from "bcryptjs";

const usuarioController = {
    listar: async (req, res) => {
        // Implementación de la función listar
    },

    crear: async (req, res) => {
        // Implementación de la función crear
    },

    prueba: async (req, res) => {
        try {

            // await usuario.findOrCreate({
            //     where: {
            //         id: '1'
            //     }, defaults: {
            //         mail: 'broitmanroman@alu.frlp.utn.edu.ar',
            //         persona_id: 1,
            //         password: bcrypt.hashSync('password')
            //     }
            // })
            res.json({
                message: 'Hello World'
            });
        } catch (error) {
            console.error(error);
        }
    }
};

export default usuarioController;