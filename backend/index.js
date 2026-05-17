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

const PORT = process.env.PORT || 4000
mongoose.connect(process.env.DB_KEY)
  .then(() => {
    console.log("connected Db")

    app.listen(PORT, () => {
      console.log(`server started on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.log("DB ERROR:", err)
  })

// Health check endpoint for deployment monitoring
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() })
})

app.post("/mail", async (req, res) => {
  const { mess, gmailid, sub } = req.body
  console.log("Subject:", sub)
  console.log("Message to send:", mess)
  console.log("Recipient emails:", gmailid)

  if (!mess || !gmailid || !Array.isArray(gmailid) || !gmailid.length) {
    return res.status(400).json({ success: false, error: "Missing message content or recipient emails." })
  }

  try {
    const data = await daminrool.find()

    if (!data.length) {
      console.error("Credentials not configured in DB collection 'bulkmail'")
      return res.status(500).json({ success: false, error: "Sender email credentials not configured in database." })
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: data[0].user,
        pass: data[0].pass,
      },
    })

    const sent = []
    const failed = []

    for (let i = 0; i < gmailid.length; i++) {
      const recipient = gmailid[i]
      try {
        const info = await transporter.sendMail({
          from: data[0].user,
          to: recipient,
          subject: sub || "find new message",
          text: mess,
        })
        console.log(`Successfully sent email to ${recipient}`)
        sent.push(recipient)
      } catch (err) {
        console.error(`Failed to send email to ${recipient}:`, err.message)
        failed.push({ email: recipient, error: err.message })
      }
    }

    res.json({
      success: sent.length > 0,
      total: gmailid.length,
      sent,
      failed
    })

  } catch (error) {
    console.error("Global mailing route error:", error)
    res.status(500).json({ success: false, error: error.message })
  }
})


 
