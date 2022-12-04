const express = require('express')
const app = express()
const {greeting} = require('./user')

app.get('/', (req,res) => res.send('This App is running properly! TESTING'))
app.get('/ping', (req,res) => res.send('Pong! Soegidev'))
app.get('/say', (req,res) => res.send('Say! Soegidev'))
app.get('/youtube', (req,res) => res.send('Hello, youtube indonesia! Fajar Soegi Hallo Good Morning Test Hei'))
app.get('/hello/:name', (req,res) => {
    res.json({message:greeting(req.params.name)})
})
module.exports = app