import express, {response} from 'express'
import bodyParser from 'body-parser'
import itemRoutes from "./items/items.js";
import path from "path";
import {fileURLToPath} from 'url';
import cors from "cors";


const app = express()
const PORT = 80
const HOST = 'localhost'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())
app.use('/static',express.static(__dirname+'public'))
app.use('/items',itemRoutes)

app.get('/',(req,resp) =>{
    resp.redirect("/items")
})
app.listen()
app.listen(PORT,HOST,console.log(`server running on http://${HOST}:${PORT}`))


