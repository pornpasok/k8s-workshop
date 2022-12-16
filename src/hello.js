const express = require('express')
const os = require('os')
const app = express()
const port = 3000

app.get('/', function (req, res) {
	res.send('<center><h1>Hello World! from  ' + String(os.hostname()) + '</h1></center>')
})

app.listen(port, () => console.log(`Hello World! listening on port ${port}!`))
