const mongooseHelper = require('../../helpers/mongoose-helper.js')
const mongoose = require('mongoose')

const carritoSchema = mongoose.Schema({
    date: {type: Date, require: true, default: new Date()},
    productos: {type: Array, require: true}
})

class carritoMongoDto extends mongooseHelper{
    constructor(){
        super('carrito', carritoSchema)
    }
}

module.exports = carritoMongoDto