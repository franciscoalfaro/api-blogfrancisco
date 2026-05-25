import './config/env.js';
import { connection } from './config/db.js';
import app from './app.js';

connection();

const puerto = 3006;
app.listen(puerto, () => {
    console.log("Server runing in port :" + puerto);
});
