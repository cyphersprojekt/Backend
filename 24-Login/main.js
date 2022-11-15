const express = require('express')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')
const moment = require('moment/moment')
const mongoose = require('mongoose')
const normalizr = require('normalizr')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const MongoHelper = require('24-Login/helpers/mongooseHelper')
const mongoCreds = require('24-Login/helpers/mongooseCreds.js')
const SQLHelper = require('24-Login/helpers/sqlHelper')

let msgsHelper = new MongoHelper("mensajes", mongoose.Schema({
    text: {type: String, required: true},
    date: {type: String, required: true},
    author: {type: Array, required: true},
}))

const mariadb = new SQLHelper({
    client: "mysql",
    connection: {
        host: "localhost",
        user: "root",
        password: "root",
        database: "coderhouse"
    }
}, "productos")

const homeRouter = require('24-Login/routes/home.js')
const productosRouter = require('24-Login/routes/productos.js')
const carritoRouter = require('24-Login/routes/carrito.js')
const productosTestRouter = require("24-Login/routes/productosTest.js")

const handlebars = require('express-handlebars')

const app = express()
const httpServer = new HttpServer(app)
const io = new IOServer(httpServer)
const bodyParser = require('body-parser')

app.use(cookieParser())
app.use(session(mongoCreds))

app.engine("hbs",
 handlebars.engine({
    extname: ".hbs",
    defaultLayout: 'main.hbs',
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials'
}))

app.set("view engine", "hbs")

app.set("views", __dirname + "/views")
console.dir(__dirname + '/views')

/* Necesito esto para poder usar sockers en mi Router */
app.set('socketio', io)

//Log time and request
app.use((req, res, next) => {
    console.log(new Date().toLocaleDateString(), new Date().toLocaleTimeString(), req.method, req.originalUrl)
    next()
})


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}))

// app.use(express.static('24-Login/public'))
app.use(homeRouter)
app.use("/api/productos", productosRouter)
app.use("/api/carrito", carritoRouter)
app.use("/api/productos-test", productosTestRouter)


// Handleo todo lo no implementado aca
app.all("*", (req, res) => {
    res.status(404)
    res.end(JSON.stringify({
        error: -2,
        descripcion: `ruta ${req.method} ${req.originalUrl} no implementada`
    }))
 });

 
// Comente todo lo de websockets que no creo estar usando
/* Envio la lista inicial de productos y mensajes a quien se conecte, el resto, se encarga el router (productosRouter con su evento newProduct) y el evento newMessage */
io.on('connection', async (socket) => {

    let products
    try{
        products = await mariadb.getAll()
    }
    catch (err){
        console.log(err)
    }

    let msgs
    try{
        msgs = await msgsHelper.getAll()
    }
    catch (err){
        console.log(err)
    }
    // console.log(msgs)
    data = {
        id: 1,
        msgs: msgs
    }

    const authorSchema = new normalizr.schema.Entity("authors")
    const msgSchema = new normalizr.schema.Entity("msgs") 
    const dataSchema = new normalizr.schema.Entity("data", {
        author: authorSchema,
        msgs: [msgSchema]
    })

    const normalized = normalizr.normalize(data, dataSchema)

    socket.emit("currentProducts", products)
    socket.emit("currentMessages", normalized)

    /* Guardo un nuevo mensaje y actualizo a todos los usuarios */
    socket.on("newMessage", async msg =>{
        msg.date = "[" + moment().format('MMMM Do YYYY, h:mm:ss a') + "]"

        try{
            await msgsHelper.insert(msg)
        }
        catch (err) {
            console.log(err)
        }

        let msgs
        try{
            msgs = await msgsHelper.getAll()
        }
        catch (err){
            console.log(err)
        }
        
        io.sockets.emit("currentMessages", msgs)
    })
})

httpServer.listen(8080, ()=>{
    console.log("App started and listening on port 8080 :)")
})
