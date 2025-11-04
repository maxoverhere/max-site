import { useState } from 'react'
import './pdfTool.css'

async function readFileAsArrayBuffer(file) {
  return await file.arrayBuffer()
}

async function mergePdfs(files) {
  const { PDFDocument } = await import('pdf-lib')
  const mergedPdf = await PDFDocument.create()
  for (const file of files) {
    const bytes = await readFileAsArrayBuffer(file)
    const pdf = await PDFDocument.load(bytes)
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((p) => mergedPdf.addPage(p))
  }
  const mergedBytes = await mergedPdf.save()
  return new Blob([mergedBytes], { type: 'application/pdf' })
}

async function extractRange(file, range) {
  const { PDFDocument } = await import('pdf-lib')
  const [startStr, endStr] = range.split('-').map((s) => s.trim())
  const start = Math.max(1, parseInt(startStr || '1', 10))
  const end = parseInt(endStr || startStr, 10)
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) {
    throw new Error('Invalid range')
  }
  const bytes = await readFileAsArrayBuffer(file)
  const src = await PDFDocument.load(bytes)
  const out = await PDFDocument.create()
  const maxIndex = src.getPageCount()
  const indices = []
  for (let i = start; i <= Math.min(end, maxIndex); i++) indices.push(i - 1)
  const pages = await out.copyPages(src, indices)
  pages.forEach((p) => out.addPage(p))
  const outBytes = await out.save()
  return new Blob([outBytes], { type: 'application/pdf' })
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function PdfTool() {
  const [mergeFiles, setMergeFiles] = useState([])
  const [extractFile, setExtractFile] = useState(null)
  const [range, setRange] = useState('2-5')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleMerge() {
    setError('')
    if (!mergeFiles.length) return
    setBusy(true)
    try {
      const blob = await mergePdfs(mergeFiles)
      downloadBlob(blob, 'merged.pdf')
    } catch (e) {
      setError(e.message || 'Merge failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleExtract() {
    setError('')
    if (!extractFile) return
    setBusy(true)
    try {
      const blob = await extractRange(extractFile, range)
      downloadBlob(blob, `extract-${range}.pdf`)
    } catch (e) {
      setError(e.message || 'Extract failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <h2>PDF Merge & Split</h2>
      {error && <p className="muted" style={{ color: '#ff6b6b' }}>{error}</p>}

      <section className="section">
        <h3>Merge PDFs</h3>
        <p className="muted">Select multiple PDFs; order will be respected.</p>
        <input
          type="file"
          accept="application/pdf"
          multiple
          onChange={(e) => setMergeFiles(Array.from(e.target.files || []))}
        />
        <div className="pdf-actions">
          <button className="btn" disabled={busy || mergeFiles.length === 0} onClick={handleMerge}>
            {busy ? 'Working…' : 'Merge and Download'}
          </button>
        </div>
      </section>

      <section className="section">
        <h3>Extract Pages</h3>
        <p className="muted">Choose a PDF and a range like 2-5 or 3-3.</p>
        <input type="file" accept="application/pdf" onChange={(e) => setExtractFile((e.target.files || [])[0] || null)} />
        <div className="pdf-grid">
          <input
            className="pdf-range"
            type="text"
            placeholder="e.g. 2-5"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          />
          <button className="btn" disabled={busy || !extractFile || !range} onClick={handleExtract}>
            {busy ? 'Working…' : 'Extract and Download'}
          </button>
        </div>
      </section>
    </main>
  )
}

export default PdfTool


