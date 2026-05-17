import { useState, useRef } from "react"
import axios from "axios"
import * as XLSX from "xlsx"

function App() {
  const [email, setemail] = useState([])
  const [subject, setsubject] = useState("")
  const [message, setmessage] = useState("")
  const [status, setstatus] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dragActive, setDragActive] = useState(false)
  
  // Custom states for alert-free confirmations
  const [sentStats, setSentStats] = useState(null) // { success: number, failed: number, total: number }
  const [errorStatus, setErrorStatus] = useState(null) // string (global server error)

  const fileInputRef = useRef(null)

  // Dynamic backend URL injection
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000"

  // Clean Excel parser (zero alerts, sets inline error states)
  const processFile = (file) => {
    if (!file) return

    setSentStats(null)
    setErrorStatus(null)

    const fileName = file.name
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls") || fileName.endsWith(".csv")
    
    if (!isExcel) {
      setErrorStatus("Unsupported file format. Please upload a valid Excel (.xlsx, .xls) or CSV sheet.")
      return
    }

    const filereader = new FileReader()
    filereader.onload = function (e) {
      try {
        const realdata = e.target.result
        const workbook = XLSX.read(realdata, { type: "binary" })
        const sheetname = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetname]
        const newdata = XLSX.utils.sheet_to_json(worksheet, { header: "A" })
        
        // Email validation format regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const validEmails = []

        newdata.forEach((item) => {
          const val = item.A
          if (val && typeof val === "string") {
            const cleaned = val.trim()
            if (emailRegex.test(cleaned)) {
              validEmails.push(cleaned)
            }
          }
        })

        if (validEmails.length === 0) {
          setErrorStatus("No valid email addresses found in the first column (Column A) of the sheet.")
          return
        }

        const uniqueEmails = [...new Set(validEmails)]
        setemail(uniqueEmails)
      } catch (err) {
        console.error("Excel processing failed:", err)
        setErrorStatus("Error reading Excel sheet. Ensure data lies in the first column.")
      }
    }

    filereader.onerror = () => {
      setErrorStatus("Error reading file from storage.")
    }

    filereader.readAsBinaryString(file)
  }

  // File click handler
  function Filetop(event) {
    const file = event.target.files[0]
    processFile(file)
  }

  // Drag-and-drop state handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0])
    }
  }

  // Remove individual email
  const deleteEmail = (emailToDelete) => {
    setemail((prev) => prev.filter((el) => el !== emailToDelete))
  }

  // Handle mail dispatching
  async function sendbut() {
    setSentStats(null)
    setErrorStatus(null)

    if (email.length === 0) {
      setErrorStatus("Recipient list is empty. Please upload an Excel sheet first.")
      return
    }
    if (!subject.trim()) {
      setErrorStatus("Mailing campaign subject is empty.")
      return
    }
    if (!message.trim()) {
      setErrorStatus("Mailing campaign message body is empty.")
      return
    }

    setstatus(true)

    try {
      const response = await axios.post(`${BACKEND_URL}/mail`, {
        mess: message,
        gmailid: email,
        sub: subject
      })

      const result = response.data
      if (result && result.success) {
        const successes = result.sent?.length || 0
        const failures = result.failed?.length || 0
        
        // Set dispatch confirmation stats
        setSentStats({
          success: successes,
          failed: failures,
          total: result.total
        })
      } else {
        setErrorStatus(result.error || "Mailing campaign dispatch was rejected by server.")
      }
    } catch (err) {
      console.error(err)
      const errorText = err.response?.data?.error || err.message || "Failed to communicate with mail server"
      setErrorStatus(errorText)
    } finally {
      setstatus(false)
    }
  }

  // Monospaced email query filter
  const filteredEmails = email.filter((item) =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      
      {/* Premium Minimal Monochromatic Header */}
      <header className="w-full py-6 px-6 md:px-12 flex justify-between items-center border-b border-neutral-900 bg-neutral-950 sticky top-0 z-40">
        <div>
          <h1 className="text-xl font-bold tracking-wider text-neutral-100">BulkMail</h1>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">Enterprise Broadcast System</p>
        </div>
        <div className="text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-800 px-3 py-1.5 rounded">
          Status: Active Node
        </div>
      </header>

      {/* Low-Color Sleek Workspace Dashboard */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 md:grid-cols-12 gap-8 relative">
        
        {/* Left Column: File Manager & Dispatch Panel (7 cols) */}
        <section className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
            
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-300 mb-4">
              Campaign Manager
            </h2>

            {/* Typography-Driven File Dropzone (Zero Icons) */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className={`relative border border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center ${
                dragActive 
                ? "border-neutral-400 bg-neutral-800/40" 
                : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={Filetop}
                disabled={status}
              />
              
              <h3 className="font-semibold text-neutral-300 text-xs">Drag & Drop Excel File</h3>
              <p className="text-[10px] text-neutral-500 mt-1">Accepts spreadsheet documents (.xlsx, .xls, .csv)</p>
              
              <button 
                type="button" 
                disabled={status}
                className="mt-4 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded text-[10px] font-semibold transition"
              >
                Browse File
              </button>
            </div>

            {/* Subject Input Textbox */}
            <div className="mt-6">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Email Subject
              </label>
              <input
                type="text"
                placeholder="Enter campaign subject..."
                value={subject}
                onChange={(e) => setsubject(e.target.value)}
                disabled={status}
                className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition font-sans"
              />
            </div>

            {/* Message Body Input Textbox */}
            <div className="mt-4">
              <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                Email Message Body
              </label>
              <textarea
                placeholder="Enter email content to dispatch..."
                value={message}
                onChange={(e) => setmessage(e.target.value)}
                disabled={status}
                className="w-full h-32 p-3 rounded bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Muted Campaign Status Metrics Display */}
            {email.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-neutral-950 border border-neutral-800 rounded p-3 text-center">
                  <p className="text-neutral-500 text-[9px] uppercase font-bold tracking-widest">Total Targets</p>
                  <p className="text-sm font-bold text-neutral-300 mt-0.5">{email.length}</p>
                </div>
                <div className="bg-neutral-950 border border-neutral-800 rounded p-3 text-center">
                  <p className="text-neutral-500 text-[9px] uppercase font-bold tracking-widest">Active File</p>
                  <p className="text-sm font-bold text-neutral-300 mt-0.5">Spreadsheet Column A</p>
                </div>
              </div>
            )}

            {/* Dispatch Action Button (Zero Icons) */}
            <button
              disabled={status}
              onClick={sendbut}
              className={`mt-6 w-full py-3 rounded font-bold text-xs uppercase tracking-wider transition duration-150 ${
                status 
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700" 
                : "bg-neutral-100 text-neutral-950 hover:bg-neutral-200 active:scale-[0.99] cursor-pointer"
              }`}
            >
              {status ? "Broadcasting Mail Campaign..." : "Launch Bulk Mail Outbox"}
            </button>

          </div>

          {/* Inline Confirmation/Alert Messages (Alert-Free System) */}
          {(status || sentStats || errorStatus) && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-3">
                System Status Response
              </h3>
              
              {status && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded text-xs text-neutral-400 font-mono animate-pulse">
                  STATUS: Campaign transmission actively processing...
                </div>
              )}

              {sentStats && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded text-xs">
                  <p className="text-neutral-300 font-bold mb-1">✓ Campaign Sent Successfully</p>
                  <p className="text-neutral-500 font-mono text-[10px] mt-1.5 leading-relaxed">
                    Success deliveries: {sentStats.success} / {sentStats.total}
                    <br />
                    Failed deliveries: {sentStats.failed} / {sentStats.total}
                  </p>
                </div>
              )}

              {errorStatus && (
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded text-xs">
                  <p className="text-neutral-400 font-bold mb-1">✕ Process Error Occurred</p>
                  <p className="text-neutral-500 font-mono text-[10px] mt-1">
                    Detail: {errorStatus}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        {/* Right Column: Recipients List Panel (5 cols) */}
        <section className="md:col-span-5 flex flex-col gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-sm flex flex-col h-[380px] overflow-hidden">
            
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Recipients ({filteredEmails.length})
              </h2>
              {email.length > 0 && (
                <button 
                  onClick={() => setemail([])}
                  disabled={status}
                  className="text-[10px] text-neutral-500 hover:text-neutral-300 font-semibold uppercase tracking-wider transition"
                >
                  Clear List
                </button>
              )}
            </div>

            {/* Query Filter */}
            <div className="relative mb-3">
              <input
                type="text"
                placeholder="Filter loaded contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 rounded bg-neutral-950 border border-neutral-800 text-xs text-neutral-300 placeholder-neutral-700 focus:outline-none focus:border-neutral-700 transition"
              />
            </div>

            {/* Clean Monospaced List (Zero Icons) */}
            <div className="flex-1 overflow-y-auto space-y-1.5 custom-scrollbar pr-1">
              {filteredEmails.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-wider">Empty Recipient List</p>
                </div>
              ) : (
                filteredEmails.map((addr, idx) => (
                  <div 
                    key={addr + idx}
                    className="flex justify-between items-center px-3 py-2 rounded bg-neutral-950/80 border border-neutral-900/60 hover:bg-neutral-900/20 hover:border-neutral-800 transition group"
                  >
                    <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[75%]">{addr}</span>
                    <button
                      onClick={() => deleteEmail(addr)}
                      disabled={status}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-neutral-600 hover:text-neutral-400 uppercase font-semibold transition-all disabled:opacity-0"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>
        </section>

      </main>

      {/* Premium Minimalist Monochromatic Footer */}
      <footer className="w-full py-6 text-center text-[9px] text-neutral-600 font-mono mt-auto border-t border-neutral-900 bg-neutral-950">
        BulkMail &bull; Secure Transmission Console &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default App