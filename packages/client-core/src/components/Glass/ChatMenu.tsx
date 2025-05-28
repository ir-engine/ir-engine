/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'
import { twMerge } from 'tailwind-merge'

const messageBaseStyles = `
  inline-grid
  max-w-full
  px-4 py-1

  border-2
  border-white/10
  rounded-xl
  shadow-lg

  break-words
  text-center
  
  sm:max-w-md
`

const OwnMessage = ({ children }) => (
  <div
    className={twMerge(
      messageBaseStyles,
      `
        self-end
  
        bg-gradient-to-r
        from-blue-500
      
        from-40%
        via-blue-400
        via-80%
      
        to-blue-400
        to-100%
      `
    )}
  >
    {children}
  </div>
)

const OtherMessage = ({ children }) => <div className={twMerge(messageBaseStyles, `bg-black/30`)}>{children}</div>

const OtherName = ({ children }) => <div className={``}>{children}</div>

const OtherChat = ({ children }) => (
  <div
    className={`
      flex flex-col gap-y-1
    `}
  >
    {children}
  </div>
)

export const ChatMenu = () => {
  return (
    <>
      <OtherChat>
        <OtherName>{`Annie`}</OtherName>
        <OtherMessage>{`Hi there! What items did you buy? I'm still deciding on the shirts`}</OtherMessage>
      </OtherChat>
      <OwnMessage>{`Ooooo. I can't decide.`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OtherChat>
        <OtherName>{`Lisa`}</OtherName>
        <OtherMessage>{`Noo! We need to match for the event. Let's go for pink! How about that?`}</OtherMessage>
      </OtherChat>
      <OwnMessage>{`Ooooo. I can't decide.`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`Ooooo. I can't decide.`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`Ooooo. I can't decide.`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`I need some help with this project`}</OwnMessage>
      <OwnMessage>{`This shousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`This shasdfadfasdfasfdasdfsafsdfasousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`This shousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`This shasdfadfasdfasfdasdfsafsdfasousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`This shousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`This shasdfadfasdfasfdasdfsafsdfasousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`This shousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`This shasdfadfasdfasfdasdfsafsdfasousdflsd goo so hardsdfskdfjslfkjslksjdflskjdflsdkfjsldkfjsdfjs`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`Maybe Green?`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
      <OwnMessage>{`MMMMMM !!!!!LKJLKJL`}</OwnMessage>
    </>
  )
}
