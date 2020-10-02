const { Database } = require("sqlite3")
const db = require("./database")



class Restaurant{
    constructor(data){
        const restaurant = this
        this.id = data.id
        this.name = data.name
        this.image = data.image
        this.menus = []

        if(this.id){
            return new Promise((resolve,reject)=>{
                db.all('SELECT * FROM menus WHERE restaurant_id=?',[restaurant.id],(err,rows) =>{
                    const arrayOfPromises = rows.map(row => new Menu(row))
                    //console.log(arrayOfPromises)
                    Promise.all(arrayOfPromises)
                        .then((menus) =>{
                            //console.log(menus)
                            restaurant.menus = menus
                            resolve(restaurant)
                        }).catch(err=> reject(err))

                })
            })
        }else{
            //console.log('outside the db callback',this)
            return new Promise((resolve,reject)=>{
                db.run('INSERT INTO restaurants(name,image) VALUES (?,?);',[restaurant.name,restaurant.image], function (err){
                    if (err) {
                        //console.log("error thrown",err)
                        return reject(err)
                    }
                    //console.log("inside the callback",this)
                    restaurant.id = this.lastID
                    return resolve(restaurant)
                })
            })
        }
    }
    async addMenu(data){
        const menu = await new Menu({title:data.title,restaurant_id:this.id})
        this.menus.push(menu)
    }

}

class Menu{
    constructor(data){
        const menu = this
        this.id = data.id
        this.title = data.title
        this.restaurant_id = data.restaurant_id
        this.items = []

        if (this.id){
            return new Promise((resolve,reject)=>{
                db.all('SELECT * FROM items WHERE menu_id=?',[menu.id],(err,rows)=>{
                    const arrayOfPromises = rows.map(row => new Item(row))
                    //console.log(arrayOfPromises)
                    Promise.all(arrayOfPromises)
                        .then((items)=>{
                            menu.items = items
                            resolve(menu)
                        })
                })
            })
        }else{
            return new Promise((resolve,reject)=>{
                db.run('INSERT INTO menus(title,restaurant_id) VALUES (?,?);',[menu.title,menu.restaurant_id],function(err){
                    if(err){
                        return reject(err)
                    }
                    menu.id = this.lastID
                    return resolve(menu)
                })
            })
        }
    }
    async addItem(data){
        const item =  await new Item({item:data.item,price:data.price,menu_id:this.id})
        this.items.push(item)
    }
}

class Item{
    constructor(data){
        const item = this
        this.id = data.id
        this.item = data.item
        this.price = data.price
        this.menu_id = data.menu_id

        if (this.id){
            return Promise.resolve(this)
        }else{
            return new Promise((resolve,reject)=>{
                db.run('INSERT INTO items(item,price,menu_id) VALUES (?,?,?);',[item.item,item.price,item.menu_id], function(err){
                    if (err){
                        return reject(err)
                    }
                    item.id = this.lastID
                    return resolve(item)
                })
            })
        }
    }
}

module.exports = {
    Restaurant,
    Menu,
    Item
}
