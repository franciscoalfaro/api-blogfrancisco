import './config/env.js';
import { connection } from './config/db.js';
import app from './app.js';

connection();

const puerto = process.env.PORT

app.listen(puerto, () => {
    console.log("Server runing in port :" + puerto);
});
