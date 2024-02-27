/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { State, useHookstate } from '@etherealengine/hyperflux'
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import Input from '../Input'

export interface LabelProps extends React.HtmlHTMLAttributes<HTMLLabelElement> {
  emailList: State<string[]>
}

const MultiEmailInput = ({ emailList }: LabelProps) => {
  const state = useHookstate({
    currentEmail: '',
    errorLabel: ''
  } as {
    currentEmail: string
    errorLabel: string
  })

  const handleKeyDown = (evt) => {
    if (['Enter', 'Tab', ','].includes(evt.key)) {
      evt.preventDefault()

      const value = state.currentEmail.value.trim()

      if (value && isValid(value)) {
        emailList.merge([state.currentEmail.value])
        state.currentEmail.set('')
      }
    }
  }

  const handleChange = (evt) => {
    state.merge({
      currentEmail: evt.target.value,
      errorLabel: ''
    })
  }

  const handleDelete = (item) => {
    emailList.set(emailList.value.filter((i) => i !== item))
  }

  const handlePaste = (evt) => {
    evt.preventDefault()

    const paste = evt.clipboardData.getData('text')
    const emails = paste.match(/[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/g)

    if (emails) {
      const toBeAdded = emails.filter((email) => !isInList(email))
      emailList.merge(toBeAdded)
    }
  }

  const isValid = (email: string) => {
    let error = ''

    if (isInList(email)) {
      error = `${email} has already been added.`
    }

    if (!isEmail(email)) {
      error = `${email} is not a valid email address.`
    }

    if (error) {
      state.errorLabel.set(error)

      return false
    }

    return true
  }

  const isInList = (email: string) => {
    return emailList.value.includes(email)
  }

  const isEmail = (email) => {
    return /[\w\d\.-]+@[\w\d\.-]+\.[\w\d\.-]+/.test(email)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {emailList.value.map((item) => (
          <div
            className="flex w-fit items-center justify-between gap-1 rounded-full bg-neutral-300 px-2 py-1 text-black"
            key={item}
          >
            {item}
            <button className="button rounded-full bg-white p-1" onClick={() => handleDelete(item)}>
              <IoMdClose />
            </button>
          </div>
        ))}
      </div>

      <Input
        className="w-full"
        value={state.currentEmail.value}
        placeholder="Type or paste email addresses and press `Enter`..."
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onPaste={handlePaste}
      />

      {state.errorLabel.value && <p className="error text-rose-500">{state.errorLabel.value}</p>}
    </>
  )
}

export default MultiEmailInput
