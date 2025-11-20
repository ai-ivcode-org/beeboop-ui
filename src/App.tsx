import React from 'react'
import './App.css'
import Chat from './components/chat/Chat'
import reactLogo from './assets/react.svg'

export default function App() {
  return (
    <>
      <div style={{ padding: 12 }}>
        <img src={reactLogo} alt="react" style={{ width: 64, height: 'auto' }} />
      </div>
      <Chat />
    </>
  )
}
