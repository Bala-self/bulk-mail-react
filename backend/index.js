const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")

const mailbox = express()
mailbox.use(cors())
mailbox.use(express.json())

mongoose.connect("mongodb://userbala:userbala@ac-x7qshsw-shard-00-00.xslctu7.mongodb.net:27017,ac-x7qshsw-shard-00-01.xslctu7.mongodb.net:27017,ac-x7qshsw-shard-00-02.xslctu7.mongodb.net:27017/passkey?ssl=true&replicaSet=atlas-14o5x4-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log("connected to mongodb"))
  .catch((error) => console.log(error))

const credential = mongoose.model("credential", {}, "credential")

mailbox.post("/sendmail", (req, res) => {
  const getmail = req.body.mail
  const getmessage = req.body.message

  credential.find({}).then((data) => {
    if (!data[0]) {
      return res.send(false)
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].toJSON().user,
        pass: data[0].toJSON().pass,
      },
    })

    new Promise(async (resolve, reject) => {
      try {
        for (let i = 0; i < getmail.length; i++) {
          await transporter.sendMail({
            from: data[0].user,
            to: getmail[i],
            text: getmessage,
          })
          console.log("email sent to:", getmail[i])
        }
        resolve("success")
      } catch (error) {
        reject("failure")
      }
    })
      .then(() => res.send(true))
      .catch(() => res.send(false))
  }).catch(() => res.send(false))
})

mailbox.listen(3000, () => {
  console.log("server is running on port 3000")
})