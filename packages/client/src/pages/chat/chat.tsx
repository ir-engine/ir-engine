import { Media } from './components/Media'
import { Message } from './components/Message'
import { User } from './components/User'

import './index.css'

import React from 'react'

export default function App() {
  return (
    <div className="w-full h-[100%] flex bg-slate-600">
      <User />
      <Message />
      <Media />
    </div>
  )
}
