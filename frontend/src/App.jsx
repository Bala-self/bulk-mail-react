import { useState } from "react"
import axios from "axios";
import * as xlsx from 'xlsx'

const App = () => {
  const [mail, setMail] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  function handleUpload(e) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    axios.post("http://localhost:3000/sendmail", { mail: mail, message: message })
      .then(() => setStatus(true))
      .catch(() => setStatus(false))
      .finally(() => setLoading(false));
  }

  function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      const maildata = event.target.result;
      const workbook = xlsx.read(maildata, { type: "binary" });
      const worksheet = workbook.SheetNames[0];
      const sheetList = workbook.Sheets[worksheet];
      const emaillist = xlsx.utils.sheet_to_json(sheetList, { header: "A" });
      const allemail = emaillist.map((item) => item.A);
      setMail(allemail);
    }
    reader.readAsBinaryString(file);
  }

  return (
    <div className="min-h-screen bg-linear-gradient-to-r from-gray-100 to-gray-300 flex items-center justify-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-4">Bulk Mail Sender</h1>
        <p className="text-gray-600 text-center mb-6">Upload an Excel file (.xls or .xlsx) and send bulk emails</p>

        <input
          type="file"
          accept=".xls,.xlsx"
          required
          onChange={handleFileUpload}
          className="w-full mb-4 p-2 border rounded-lg focus:ring-2 focus:ring-gray-400"
        />

        <textarea
          cols="30"
          rows="6"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-gray-400 mb-4"
        ></textarea>

        <button
          type="button"
          onClick={handleUpload}
          className={`w-full py-3 rounded-lg font-semibold transition 
            ${loading ? "bg-gray-400 text-white" : "bg-gray-800 text-white hover:bg-gray-900"}`}
        >
          {loading ? "Sending..." : "Send"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Total emails loaded: <span className="font-semibold">{mail.length}</span>
        </p>

        {status === true && (
          <div className="mt-4 p-3 bg-green-200 text-green-800 rounded-lg text-center font-medium">
            Emails sent successfully
          </div>
        )}
        {status === false && (
          <div className="mt-4 p-3 bg-red-200 text-red-800 rounded-lg text-center font-medium">
            Failed to send emails
          </div>
        )}
      </div>
    </div>
  )
}

export default App

