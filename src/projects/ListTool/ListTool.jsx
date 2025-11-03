import { useMemo, useState } from 'react'
import './listTool.css'

function normalizeLines(text) {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)
}

function ListTool() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [showDiff, setShowDiff] = useState(false)

  const leftLines = useMemo(() => normalizeLines(leftText), [leftText])
  const rightLines = useMemo(() => normalizeLines(rightText), [rightText])

  const leftSet = useMemo(() => new Set(leftLines), [leftLines])
  const rightSet = useMemo(() => new Set(rightLines), [rightLines])

  function sortLeft() {
    setLeftText([...leftLines].sort((a, b) => a.localeCompare(b)).join('\n'))
  }

  function sortRight() {
    setRightText([...rightLines].sort((a, b) => a.localeCompare(b)).join('\n'))
  }

  function toggleDiff() {
    setShowDiff((v) => !v)
  }

  return (
    <main className="page">
      <h2 className="heading-2">List Tool</h2>
      <div className="tool-header">
        <button className="btn" onClick={toggleDiff}>{showDiff ? 'Clear Diff' : 'Diff'}</button>
      </div>
      <div className="tools-grid">
        <div className="tools-col">
          <div className="tools-col__header">
            <button className="btn" onClick={sortLeft}>Sort alphabetically</button>
          </div>
          {!showDiff ? (
            <textarea
              className="tools-textarea"
              placeholder="One item per line"
              value={leftText}
              onChange={(e) => setLeftText(e.target.value)}
            />
          ) : (
            <ul className="diff-list">
              {leftLines.map((line, i) => (
                <li key={i} className={!rightSet.has(line) ? 'diff-line missing' : 'diff-line'}>{line}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="tools-col">
          <div className="tools-col__header">
            <button className="btn" onClick={sortRight}>Sort alphabetically</button>
          </div>
          {!showDiff ? (
            <textarea
              className="tools-textarea"
              placeholder="One item per line"
              value={rightText}
              onChange={(e) => setRightText(e.target.value)}
            />
          ) : (
            <ul className="diff-list">
              {rightLines.map((line, i) => (
                <li key={i} className={!leftSet.has(line) ? 'diff-line missing' : 'diff-line'}>{line}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  )
}

export default ListTool


