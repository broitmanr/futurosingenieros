const usuarioController = {
    listar: async (req, res) => {
        // Implementación de la función listar
    },

    crear: async (req, res) => {
        // Implementación de la función crear
    },

    prueba: async (req, res) => {
        try {
            console.log('ejec prueba');

            res.json({
                message: 'Hello World'
            });
        } catch (error) {
            console.error(error);
        }
    }
};

export default usuarioController;