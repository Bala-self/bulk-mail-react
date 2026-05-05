const express = require("express")
const cors = require("cors")
const nodemailer = require("nodemailer")
const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

const schema = new mongoose.Schema({
  user: String,
  pass: String
})

const daminrool = mongoose.model("daminrool", schema, "bulkmail")

mongoose.connect(process.env.DB_KEY)
  .then(() => {
    console.log("connected Db")

    app.listen(4000, () => {
      console.log("server started")
    })
  })
  .catch((err) => {
    console.log("DB ERROR:", err)
  })

app.post("/mail", async (req, res) => {
  const mess = req.body.mess
  console.log(mess)

  const emailfile = req.body.gmailid

  if (!mess || !emailfile || !emailfile.length) {
    return res.send(false)
  }

  try {
    const data = await daminrool.find()

    if (!data.length) {
      return res.send(false)
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass,
      },
    })

    for (let i = 0; i < emailfile.length; i++) {
      const info = await transporter.sendMail({
        from: data[0].user,
        to: emailfile[i],
        subject: "find new message",
        text: mess,
      })

      console.log(info)
      console.log("success")
    }

    res.send(true)

  } catch (error) {
    console.log(error)
    res.send(false)
  }
})



