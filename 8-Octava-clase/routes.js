const express = require('express');
const router = express.Router();
const random = require('random');
const Contenedor = require('../4-Cuarta-clase/desafio-2-revised.js')
const contenedor1 = new Contenedor('./productos.txt')
const bodyParser = require('body-parser')


router.get('/productos', (req, res) => {
    const data = contenedor1.getAllData();
    res.send(data);
    }
);

router.get('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const prod = contenedor1.getById(id);
    const error = {'error':'producto no encontrado'}
    if (!prod) {res.send(error) } else { res.send(prod); } }
);

router.post('/productos', (req, res) => {
    const itemToAdd = req.body;
    res.send(contenedor1.save(itemToAdd));
    }
);

router.put('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const itemToUpdate = req.body;
    res.send(contenedor1.update(id, itemToUpdate));
    }
);

router.delete('/productos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    res.send(contenedor1.deleteById(id))
    }
);


module.exports = router;