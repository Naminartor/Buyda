
const express = require('express')
const app = express()
const port = 3000
app.use(express.static("./public"))

app.get('/hello', (req, res) => {
    res.send('World!')
})

app.post("/api",(req, res) => {
    res.send('POST request to the api')
})

app.get('/users/:userId/', (req, res) => {
    res.send(req.params)
})
app.get('/users/:userId/books/:bookId', (req, res) => {
    res.send(req.params)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
