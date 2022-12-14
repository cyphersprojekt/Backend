const fs = require('fs');
const knex = require('knex')


class Product {
    constructor(name, price, thumbnail, id) {
        this.name = name;
        this.price = price;
        this.thumbnail = thumbnail;
        this.id = id;
    }
}

class Contenedor {
    constructor(path) {
        this.path = path;
    }

    createFile() {
        fs.writeFileSync(this.path, '', (e) => {
            if (e) { console.log(e); }
        });
    }

    save(obj) {
        try {
            if (!fs.existsSync(this.path) || fs.readFileSync(this.path).length === 0) {
                this.createFile();
                obj.id = 1;
                let data = [obj];
                fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
                console.log(`Se creo el archivo nuevo y se inserto ${obj.name} porque no existia`)
                return {"created":`${obj.id}`};
            } else {
                let data = JSON.parse(fs.readFileSync(this.path));
                obj.id = data.length + 1;
                data.push(obj)
                console.log(`Se agrego el objeto ${obj.name} al archivo que ya estaba`)
                fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
                return {"created":`${obj.id}`};

            }
        } catch(e){ console.log(e) }
    }

    update(id, newData) {
        try {
            let data = JSON.parse(fs.readFileSync(this.path));
            let index = data.findIndex(x => x.id === id);
            if (index == -1 ) {
                return {"error": "no se encontro el id para actualizer"}
            } else {
                data[index].title = newData.title;
                data[index].price = newData.price;
                data[index].thumbnail = newData.thumbnail;
                fs.writeFileSync(this.path, JSON.stringify(data, null, 2));
                return {"success": `se actualizo el producto con id ${id}`}
            } } catch(e){ console.log(e)  }
        }
    getById(id) {
        try {
            let data = JSON.parse(fs.readFileSync(this.path));
            let index = data.findIndex(x => x.id === id);
            if (index == -1) {return null}
            else { return (data[index])
        }} catch(e){ console.log(e) } }

    deleteById(id) {
        try {
            let data = JSON.parse(fs.readFileSync(this.path));
            let index = data.findIndex(x => x.id === id);
            if (index == -1) {return {"error": `no se encontro el item con id ${id}`}}
            else { 
                data.splice(index, 1);
                data.forEach((element) =>{ if (element.id > index) {element.id -= 1}} );
                fs.writeFileSync(this.path, JSON.stringify(data, null, 2))                ;
                return {"success": `Se borro el id ${id} con indice ${index}`}}
        } catch(e){ console.log(e) } }


    getAllData() {
        try {
            let data = JSON.parse(fs.readFileSync(this.path));
            return data }catch(e){
                if (e.code === "ENOENT") {
                    console.log(`Se creo el archivo ${this.path}`)
                    this.createFile()}
                else {console.log(e);}
        }
    }

    deleteAllData() {
        this.createFile();
    }
}


console.log(`\r\n`)


module.exports = Contenedor;