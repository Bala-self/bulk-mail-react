import { useState } from "react"
import axios from "axios"
import * as XLSX from "xlsx"

function App() {
  const [email, setemail] = useState([])
  const [message,setmessage]=useState("")
  const [status,setstatus]=useState(false)

  async function sendbut() {

  setstatus(true)
  try {
    const push = await
axios.post("http://localhost:4000/mail",{mess:message,gmailid:email})
if (push.data == true) {
   console.log("data recived");   
}else{
  console.log("data no recived");  
}
  } catch (err) {
    console.log(err);
    console.log("server error");    
  }
  alert("sending succesfully")
  setstatus(false)
  }
  function Filetop() {
    const filedata = event.target.files[0]
    const filereader =new FileReader()
    filereader.onload=function (e) {
      const realdata = e.target.result
      const workbook =XLSX.read(realdata,{ type:"binary"})
const sheetname =workbook.SheetNames[0]
const worksheet = workbook.Sheets[sheetname]
const newdata =XLSX.utils.sheet_to_json(worksheet,{header:"A"})
const maillist = newdata.map((item)=>{
  return item.A
})
console.log(maillist)
setemail(maillist)
}
filereader.readAsBinaryString(filedata)
  }





return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 flex flex-col items-center">

      <div className="w-full bg-blue-900 text-white text-center py-4 shadow-md">
        <h1 className="text-3xl font-semibold tracking-wide">BulkMail</h1>
        <p className="text-sm opacity-80">
          Send multiple emails quickly and efficiently
        </p>
      </div>

      <div className="bg-white mt-10 rounded-2xl shadow-xl p-6 w-[90%] max-w-md">

        <div className="border-2 border-dashed border-blue-400 rounded-xl p-6 text-center bg-blue-50 hover:bg-blue-100 transition">
          <p className="text-blue-700 font-medium">Drag & Drop Excel File</p>
          <p className="text-sm text-gray-500 mt-1">or choose file below</p>
        </div>

        <div className="mt-4 text-center">
          <input
            type="file"
            className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 text-gray-600"
            onChange={Filetop}
          />
        </div>

        <div className="mt-6">
          <textarea
            placeholder="Enter your email message..."
            value={message}
            onChange={(e) => setmessage(e.target.value)}
            className="w-full h-28 p-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
        </div>

        <div className="mt-4 text-sm text-gray-600 text-center">
          Total emails in file: <span className="font-semibold">{email.length}</span>
        </div>

        <button
          className="mt-6 w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition shadow-md"
          onClick={sendbut}
        >
          {status ? "sending" : "send"}
        </button>

      </div>

      <div className="mt-8 w-[90%] max-w-md h-40 bg-white rounded-xl shadow-md flex items-center justify-center text-gray-400">
        Preview / Logs
      </div>

    </div>
  )
}

export default App