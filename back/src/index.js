import express from 'express';
import { PORT } from './const/globalConstant.js';
import {rutas_auth, rutas_init} from './routes/index.routes.js';
import sequelize from './config/database.js';
import errorHandler from './middlewares/error.js'

const configuracionApi = async (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(errorHandler)
};

const configuracionRouter = async (app) => {
    app.use('/api/', rutas_init())
    app.use('/',rutas_auth())
    app.use(errorHandler)
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