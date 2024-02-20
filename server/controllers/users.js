const usersRouter = require("express").Router()
const User = require("../models/Users")
const bcrypt = require("bcrypt")

usersRouter.post("/", async (req, res) => {
   const { body } = req
   const { userName, email, password, google} = body
   const passwordHash = await bcrypt.hash(password, 10)
   const user = new User({
      userName,
      email,
      passwordHash, 
      google
   })
    User.find({$or: [{ userName: userName},{email: email}]}
    ).then( async (result) => {
      console.log(result)
         if (result.length >= 1) {
            res.status(406).json("Usuario o email ya registrado")
         } else {
            const savedUser = await user.save()
            res.status(201).json(savedUser)
         }
      })
})
module.exports = usersRouter