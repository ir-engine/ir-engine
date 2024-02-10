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

type Effect = {
  lastVals?: Array<any>
  lastCallback?: () => void
}

type Context = {
  children: Array<Context | Effect>
  lastVals: Array<any>
}

const contexts = {} as { [key: string]: Context }

let _currentContext = null as Context | null
let _index = 0

const runContext = (context: string, cb: () => void) => {
  if (!contexts[context]) {
    contexts[context] = {
      children: [],
      lastVals: []
    }
  }
  _currentContext = contexts[context]
  cb()
  _currentContext = null
}

const runGroup = <T>(arr: Array<T>, cb: (val: T) => void) => {
  const _context = _currentContext
  if (!_context) throw new Error('group must be called within a context')

  // run cleanup for all children that are no longer in the array
  let i = 0
  for (const val of _context.lastVals) {
    if (val === arr[i]) {
      i++
      continue
    }

    const context = _context.children[i] as Context | Effect
    console.log('cleaning up', i, context)
    if ('children' in context) {
      for (const child of context.children) {
        if ('lastCallback' in child) {
          child.lastCallback?.()
        }
      }
    }
    if ('lastCallback' in context) {
      context.lastCallback?.()
    }
  }

  _context.lastVals = [...arr]

  _index = 0
  // run cb for all children that are in the array
  for (let i = 0; i < arr.length; i++) {
    if (!_context.children[i]) {
      _context.children.push({
        children: [],
        lastVals: []
      })
    }
    _currentContext = _context
    cb(arr[i])
    _index++
    _currentContext = _context
  }
}

const runEffect = (cb: () => (() => void) | void, deps: Array<any>) => {
  const _context = _currentContext
  if (!_context) throw new Error('onChange must be called within a context')

  const index = _index

  // console.log(_context, index)

  if (!_context.children[index]) {
    _context.children[index] = {
      lastVals: new Array(deps.length).fill(undefined),
      lastCallback: undefined
    } as Effect
  }

  const context = _context.children[index] as Effect

  if (!context?.lastVals) {
    context.lastVals = new Array(deps.length).fill(undefined)
  }

  const lastVals = context.lastVals!

  for (let i = 0; i < lastVals.length; i++) {
    if (lastVals[i] !== deps[i]) {
      if (context.lastCallback) context.lastCallback()
      context.lastCallback = cb() as () => void | undefined
      lastVals[i] = deps[i]
    }
  }
}

const Runner = { runContext, runGroup, runEffect }

export { Runner }
