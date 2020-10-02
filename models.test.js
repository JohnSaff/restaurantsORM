const {Restaurant,Menu,Item} = require('./models')
const { Database } = require("sqlite3")
const db = require("./database")


describe('restaurant tests',() =>{
    beforeAll((done)=>{
        db.exec('CREATE TABLE IF NOT EXISTS restaurants(id INTEGER PRIMARY KEY, name TEXT, image TEXT);CREATE TABLE IF NOT EXISTS menus(id INTEGER PRIMARY KEY, title TEXT, restaurant_id INTEGER);CREATE TABLE IF NOT EXISTS items(id INTEGER PRIMARY KEY, item TEXT, price FLOAT, menu_id INTEGER);',done)
    })
    test('restaurant is created it is added to the db',async ()=>{
        const restaurant = await new Restaurant({name:'the foo bar',image:"some.url"})
        //console.log(restaurant)
        expect(restaurant.id).toBe(1)

    })
    test('get a restaurant for the data row', async ()=>{
        db.get('SELECT * FROM restaurants WHERE id=1;', async (err,row)=>{
            expect(row.name).toBe("the foo bar")
            const restaurant = await new Restaurant(row)
            //console.log(restaurant)
            expect(restaurant.id).toBe(1)
            expect(restaurant.name).toBe('the foo bar')
        })
    })

    test('menu is created it is added to the db',async ()=>{
        const menu = await new Menu({title:'drinks menu',restaurant_id:1})
        //console.log(menu)
        expect(menu.id).toBe(1)

    })
    test('get a menu and from row',async ()=>{
        db.get('SELECT * FROM menus WHERE id=1;', async (err,row)=>{
            expect(row.title).toBe('drinks menu')
            const menuRow = await new Menu(row)
            //console.log(menuRow)
            expect(menuRow.id).toBe(1)
            expect(menuRow.title).toBe('drinks menu')
        })
    })

    test('item is created it is added to the db',async ()=>{
        const item = await new Item({item:'neck oil',menu_id:1,price:4.20})
        //console.log(item)
        expect(item.id).toBe(1)

    })
    test('get an item and from row',async ()=>{
        db.get('SELECT * FROM items WHERE id=1;', async(err,row)=>{
            const itemRow = await new Item(row)
            expect(row.item).toBe("neck oil")
            //console.log(itemRow)
            expect(itemRow.id).toBe(1)
            expect(itemRow.item).toBe('neck oil')
        })
    })
    test('can the price of another item on menu',async(done)=>{
        const item2 = await new Item({item:'NEIPA',menu_id:1,price:3.70})
        //console.log(item2)
        db.get('SELECT * FROM items WHERE id = 2;', async(err,row)=>{
            const item2row = await new Item(row)
            //console.log(item2row)
            expect(row.price).toBe(3.7)
            done()
        })
    })
    test('can get the sum of prices',async(done)=>{
        const item3 = await new Item({item:'east IPA',menu_id:1,price:3.4})
        db.get('SELECT SUM(price) FROM items;', (err,sum)=>{
            price = Object.values(sum)[0]
            //console.log(price)
            expect(price).toBe(11.3)
            done()
        })
    })
    test('can count the number of items on a menu',async(done)=>{
        db.get('SELECT title, COUNT(item) FROM menus JOIN items ON menus.id=items.menu_id;',(err,out)=>{
            //console.log(out)
            done()
        })
    })
    test('a restaurant should have menus',async (done)=>{
        const restaurant = await new Restaurant({name:'rice-n-pot',image:'image.url'})
        expect(restaurant.menus.length).toBe(0)
        await restaurant.addMenu({title:'desert'})
        expect(restaurant.menus[0] instanceof Menu).toBeTruthy()
        expect(restaurant.menus[0].id).toBeTruthy()
        await restaurant.addMenu({title:'childs menu'})
        await restaurant.addMenu({title:'Main'})

        db.get('SELECT * FROM restaurants WHERE id = ?', [restaurant.id],async (err,row) =>{
            console.log(row)
            const ricenpot = await new Restaurant(row)
            expect(ricenpot.id).toBe(restaurant.id)
            expect(ricenpot.menus[0] instanceof Menu).toBeTruthy()
            done()
        })
    })
})
