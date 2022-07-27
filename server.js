//Server/dependencies Setup
const express = require('express')
const app = express()
const MongoClient = require('mongodb').MongoClient //DB connection
const PORT = 2121
require('dotenv').config()

//Database Setup
let db,
    dbConnectionStr = process.env.DB_STRING,
    dbName = 'todo'

//DB Connection
MongoClient.connect(dbConnectionStr, { useUnifiedTopology: true })
    .then(client => {
        console.log(`Connected to ${dbName} Database`)
        db = client.db(dbName)
    })
   
//Express Setup
app.set('view engine', 'ejs') //Allows you to use EJS
app.use(express.static('public')) //Allows access to public folder
app.use(express.urlencoded({ extended: true })) //Allow easy data transfer (returns object, replaces bodyparser)
app.use(express.json()) //Parses incoming JSON requests

//Manage GET request for Homepage
app.get('/',async (request, response)=>{
    const todoItems = await db.collection('todos').find().toArray()
    const itemsLeft = await db.collection('todos').countDocuments({completed: false})
    response.render('index.ejs', { items: todoItems, left: itemsLeft })
    // db.collection('todos').find().toArray()
    // .then(data => {
    //     db.collection('todos').countDocuments({completed: false})
    //     .then(itemsLeft => {
    //         response.render('index.ejs', { items: data, left: itemsLeft })
    //     })
    // })
    // .catch(error => console.error(error))
})
//POSTing new item
app.post('/addTodo', (request, response) => {
    db.collection('todos').insertOne({thing: request.body.todoItem, completed: false})
    .then(result => {
        console.log('Todo Added')
        response.redirect('/')
    })
    .catch(error => console.error(error))
})
//When user check Completed
app.put('/markComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: true //Set completed property to True
          }
    },{
        sort: {_id: -1}, //Sort in Descending Order
        upsert: false //insert and Update DB entry
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})
//When User Unchecks Completed
app.put('/markUnComplete', (request, response) => {
    db.collection('todos').updateOne({thing: request.body.itemFromJS},{
        $set: {
            completed: false //Set completed property to False
          }
    },{
        sort: {_id: -1}, //Sort in Descending Order
        upsert: false //insert and Update DB entry
    })
    .then(result => {
        console.log('Marked Complete')
        response.json('Marked Complete')
    })
    .catch(error => console.error(error))

})
//When user clicks Delete Item
app.delete('/deleteItem', (request, response) => {
    db.collection('todos').deleteOne({thing: request.body.itemFromJS})
    .then(result => {
        console.log('Todo Deleted')
        response.json('Todo Deleted')
    })
    .catch(error => console.error(error))

})
//listen on port
app.listen(process.env.PORT || PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})