import React from 'react'

import { ChatSection } from './components/ChatSection'
import { Media } from './components/Media'
import { Message } from './components/Message'
import { Sidebar } from './components/Sidebar'

import './index.css'

export default function App() {
  return (
    <div className="w-full h-[100%] flex bg-slate-600 pointer">
      <Sidebar />
      <ChatSection />
      <Message />
      <Media />
    </div>
  )
}
