import React from 'react'

import { ChatSection } from '@etherealengine/ui/src/components/Chat/ChatSection'
import { Media } from '@etherealengine/ui/src/components/Chat/Media'
import { Message } from '@etherealengine/ui/src/components/Chat/Message'
import { Sidebar } from '@etherealengine/ui/src/components/Chat/Sidebar'

import './index.css'

import EngineTW from '@etherealengine/client/src/engine_tw'
import { ThemeContextProvider } from '@etherealengine/client/src/themes/themeContext'

export default function Chat() {
  return (
    <EngineTW>
      <ThemeContextProvider>
        <div className="w-full h-[100%] flex bg-slate-600 pointer">
          <Sidebar />
          <ChatSection />
          <Message />
          <Media />
        </div>
      </ThemeContextProvider>
    </EngineTW>
  )
}
