import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import './Chat.css'

export default function Chat({ onSend, initialMessages = [] }) {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Welcome to **chat**!\n\nYou can use _Markdown_ (e.g. `inline code`, lists, tables).', sender: 'system', time: Date.now() },
    ...initialMessages
  ])

  const [input, setInput] = useState('')
  const [user, setUser] = useState('me')
  const listRef = useRef(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  function addMessage(text, sender = 'me') {
    const trimmed = text?.trim()
    if (!trimmed) return
    const msg = { id: Date.now(), text: trimmed, sender, time: Date.now() }
    setMessages(prev => [...prev, msg])
    if (onSend) onSend(msg)
  }

  function handleSubmit(e) {
    if (e) e.preventDefault()
    addMessage(input, user)
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="chat">
      <div className="chat__list" ref={listRef}>
        {messages.map(m => (
          <div key={m.id} className={`chat__message ${m.sender === 'me' ? 'me' : 'other'}`}>
            <div className="chat__bubble">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {m.text}
              </ReactMarkdown>
            </div>
            <div className="chat__time">{new Date(m.time).toLocaleTimeString()}</div>
          </div>
        ))}
      </div>

      <form className="chat__form" onSubmit={handleSubmit}>
        <select
            value={user}
            onChange={e => setUser(e.target.value)}
        >
            <option value="me">Me</option>
            <option value="other">Other</option>
        </select>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Anything..."
          aria-label="Message"
          rows={2}

        />
        <button type="submit">Send</button>
      </form>
    </div>
  )
}