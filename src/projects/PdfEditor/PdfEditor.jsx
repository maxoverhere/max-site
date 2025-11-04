import { useState, useEffect } from 'react'
import * as pdfjsLib from 'pdfjs-dist'
import './pdfEditor.css'

pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

async function extractTextItems(pdfUrl) {
  const loadingTask = pdfjsLib.getDocument(pdfUrl)
  const pdf = await loadingTask.promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const items = textContent.items.map((item, idx) => ({
      id: `${i}-${idx}`,
      page: i,
      text: item.str,
      font: item.fontName || 'unknown',
      size: item.height || 12,
      transform: item.transform,
      x: item.transform[4],
      y: item.transform[5],
    }))
    pages.push({ pageNum: i, items })
  }
  return pages
}

async function rebuildPdf(originalFile, editedItems) {
  const { PDFDocument, rgb } = await import('pdf-lib')
  const bytes = await originalFile.arrayBuffer()
  const srcPdf = await PDFDocument.load(bytes)
  const newPdf = await PDFDocument.create()
  const pageMap = new Map()
  for (let i = 0; i < srcPdf.getPageCount(); i++) {
    const [srcPage] = await newPdf.copyPages(srcPdf, [i])
    const newPage = newPdf.addPage(srcPage)
    pageMap.set(i + 1, newPage)
  }
  for (const item of editedItems) {
    if (!item.text.trim()) continue
    const page = pageMap.get(item.page)
    if (!page) continue
    try {
      const font = await newPdf.embedFont('Helvetica')
      page.drawText(item.text, {
        x: item.x,
        y: page.getHeight() - item.y,
        size: item.size,
        font,
        color: rgb(0, 0, 0),
      })
    } catch (e) {
      console.warn('Failed to draw text item:', e)
    }
  }
  const pdfBytes = await newPdf.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
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

function PdfEditor() {
  const [file, setFile] = useState(null)
  const [fileUrl, setFileUrl] = useState(null)
  const [pages, setPages] = useState([])
  const [editedItems, setEditedItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl)
    }
  }, [fileUrl])

  async function handleFileSelect(e) {
    const selected = e.target.files?.[0]
    if (!selected) return
    setError('')
    setBusy(true)
    try {
      const url = URL.createObjectURL(selected)
      setFile(selected)
      setFileUrl(url)
      const extracted = await extractTextItems(url)
      setPages(extracted)
      const allItems = extracted.flatMap((p) => p.items)
      setEditedItems(allItems)
    } catch (e) {
      setError(e.message || 'Failed to parse PDF')
    } finally {
      setBusy(false)
    }
  }

  function updateItem(id, newText) {
    setEditedItems((items) => items.map((it) => (it.id === id ? { ...it, text: newText } : it)))
  }

  async function handleSave() {
    if (!file) return
    setError('')
    setBusy(true)
    try {
      const blob = await rebuildPdf(file, editedItems)
      downloadBlob(blob, `edited-${file.name}`)
    } catch (e) {
      setError(e.message || 'Failed to rebuild PDF')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <h2>PDF Editor <span style={{ fontSize: '0.6em', opacity: 0.7 }}>(beta)</span></h2>
      {error && <p className="muted" style={{ color: '#ff6b6b' }}>{error}</p>}

      <section className="section">
        <input type="file" accept="application/pdf" onChange={handleFileSelect} disabled={busy} />
        {file && (
          <div className="pdf-editor-actions">
            <button className="btn" disabled={busy || editedItems.length === 0} onClick={handleSave}>
              {busy ? 'Processing…' : 'Save Edited PDF'}
            </button>
          </div>
        )}
      </section>

      {pages.length > 0 && (
        <>
          <section className="section">
            <h3>PDF Content Preview</h3>
            <div className="pdf-editor-preview">
              {pages.map((page) => (
                <div key={page.pageNum} className="pdf-editor-preview-page">
                  <h4>Page {page.pageNum}</h4>
                  <div className="pdf-editor-preview-text">
                    {page.items.map((item, idx) => {
                      const edited = editedItems.find((e) => e.id === item.id)
                      const text = edited?.text || item.text
                      return (
                        <span key={item.id} className="pdf-editor-preview-item" title={`Font: ${item.font}, Size: ${item.size.toFixed(1)}pt`}>
                          {text}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="section">
            <h3>Text Content (Editable)</h3>
            <div className="pdf-editor-content">
            {pages.map((page) => (
              <div key={page.pageNum} className="pdf-editor-page">
                <h4>Page {page.pageNum}</h4>
                <div className="pdf-editor-items">
                  {page.items.map((item) => {
                    const edited = editedItems.find((e) => e.id === item.id)
                    return (
                      <div key={item.id} className="pdf-editor-item">
                        <div className="pdf-editor-meta">
                          <span className="pdf-editor-font">{item.font}</span>
                          <span className="pdf-editor-size">{item.size.toFixed(1)}pt</span>
                          <span className="pdf-editor-pos">
                            ({item.x.toFixed(0)}, {item.y.toFixed(0)})
                          </span>
                        </div>
                        <textarea
                          className="pdf-editor-text"
                          value={edited?.text || item.text}
                          onChange={(e) => updateItem(item.id, e.target.value)}
                          rows={1}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
        </>
      )}
    </main>
  )
}

export default PdfEditor

