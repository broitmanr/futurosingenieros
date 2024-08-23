const express = require('express')
const { PORT } = require('./const/globalConstant')
const {rutas_auth, rutas_init} =  require('./routes/index.routes');
// import sequelize from './config/database.js';
const errorHandler = require('./middlewares/error')
// import errorHandler from './middlewares/error.js'
// import cookieParser from 'cookie-parser'
const cookieParser = require('cookie-parser')
const cors = require('cors');
const { swaggerDocs } = require('./swagger')


const configuracionApi = async (app) => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(cors({
        origin:process.env.RUTA_FRONT, // La URL del frontend
        credentials: true // Esto permite que las cookies se envíen y reciban
    }));
    app.use(errorHandler)
};

const configuracionRouter = async (app) => {
    app.use(cookieParser())
    app.use('/api/', rutas_init())
    app.use('/',rutas_auth())
    app.use(errorHandler)
};

const init = async () => {
    const app = express();
    try {
        // await sequelize.authenticate();
        // sequelize.sync();
        console.log('Conexión establecida exitosamente. 1');

        app.listen(PORT, () => {
            console.log(`App escuchando en puerto ${PORT}`);
            swaggerDocs(app,PORT)
        });
    } catch (err) {
        console.error('Error al conectarse a la base:', err);
    }
    await configuracionApi(app);
    await configuracionRouter(app);

};

init();