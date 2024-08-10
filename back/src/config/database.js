import Sequelize from 'sequelize';
import pico from 'picocolors';
import dotenv from 'dotenv';

dotenv.config();

const host = process.env.DB_HOST
const port = process.env.DB_PORT
const database = process.env.DB_NAME
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD

const sequelize = new Sequelize(database, user, password, {
    host: host,
    dialect: 'mysql',
    port: port,
    logging: true
    // logging: false - Si no quiero ver los logs de parte de la BD por sobre-informacion usar esta linea
});

sequelize.authenticate()
    .then(() => {
        console.log(pico.yellow('Conexión establecida exitosamente.'));
        return sequelize.sync(); 
    })
    .then(() => {
        console.log(pico.green('Base de datos sincronizada exitosamente.'));
    })
    .catch(err => {
        console.error(pico.red('Error al conectarse a la base:'), pico.red(err));
    });

export default sequelize;
