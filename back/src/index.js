import express from 'express';
import { PORT } from './const/globalConstant.js';
import { rutas_init } from './routes/index.routes.js';
import sequelize from './config/database.js';

const configuracionApi = async (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
};

const configuracionRouter = async (app) => {
    app.use('/api/', rutas_init());
};

const init = async () => {
    const app = express();
    await configuracionApi(app);
    await configuracionRouter(app);

    try {
        await sequelize.authenticate();
        console.log('Conexión establecida exitosamente.');
        await sequelize.sync();
        console.log('Base de datos sincronizada exitosamente.');

        app.listen(PORT, () => {
            console.log(`App escuchando en puerto ${PORT}`);
        });
    } catch (err) {
        console.error('Error al conectarse a la base:', err);
    }
};

init();