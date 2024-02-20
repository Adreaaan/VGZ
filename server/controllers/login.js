const bcrypt = require("bcrypt")
const User = require("../models/Users")
const loginRouter = require("express").Router()

loginRouter.post("/", async (req, res, next) => {
    const { body } = req
    const { userName, password, google } = body
    const user = await User.findOne({ userName })
    if (password == "" && !google) {
        res.status(401).json({ "error": "Inicia seion con Google" })
    } else {
        if (password == "" && google) {
            return res.status(202).send({
                username: user.userName
            })
        } else {
            const passwordCorrect = user === null
                ? false
                : await bcrypt.compare(password, user.passwordHash)

            if (!passwordCorrect) {
                return res.status(401).json({
                    "error": "El usuario o contraseña está mal"
                })
            } else {
                const userToken = {
                    username: user.userName
                }
                return res.status(202).send({
                    username: user.userName
                })
            }
        }
    }
})

module.exports = loginRouter