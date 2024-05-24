
const express = require('express')
const cookieParser = require('cookie-parser');
const app = express()
const port = 3000
app.use(express.static("./public", {extensions: ['html', 'htm'],}))
app.use(cookieParser());
app.use(express.json());
const api = require("./src/api")(app)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
