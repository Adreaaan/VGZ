const mongoose = require("mongoose")
const dotenv = require('dotenv').config()

const conectionString = process.env.MONGO

mongoose.connect(conectionString)
.then(()=>console.log("Base de datos conectada"))