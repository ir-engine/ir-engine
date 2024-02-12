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
  lastVals: Array<any>
  lastCallback?: () => void
}

type SubContext = {
  groups: Record<string | number, SubContext>
  effects: Record<string | number, Effect>
  effectIndex: number
  lastVals: Array<any>
}

type Context = SubContext & {
  cleanup: () => void
}

export const contexts = {} as { [key: string]: Context }

let _currentContext = null as SubContext | null

const _cleanup = () => {
  const context = _currentContext!
  for (const child of Object.values(context.groups)) {
    if (typeof child !== 'object') continue
    if ('groups' in child) {
      _currentContext = child as SubContext
      _cleanup()
      _currentContext = context
    }
  }
  for (const child of Object.values(context.effects)) {
    if (child.lastCallback) {
      child.lastCallback()
    }
  }
}
const runContext = (context: string, cb: () => void) => {
  if (!contexts[context]) {
    contexts[context] = {
      effects: {},
      groups: {},
      lastVals: [],
      effectIndex: 0,
      cleanup: () => {
        _currentContext = contexts[context]
        _cleanup()
        _currentContext = null
        delete contexts[context]
      }
    }
  }
  _currentContext = contexts[context]
  _currentContext.effectIndex = 0
  cb()
  // console.log('runContext', JSON.stringify(_currentContext, null, 2))
  _currentContext = null

  return contexts[context]
}

const runGroup = <T = string | number>(arr: Array<T>, cb: (val: T) => void) => {
  const _parentContext = _currentContext
  if (!_parentContext) throw new Error('group must be called within a context')

  if (!_parentContext.lastVals) {
    _parentContext.lastVals = []
  }

  // run cleanup for all children that are no longer in the array
  for (const val of _parentContext.lastVals) {
    if (arr.includes(val)) {
      // todo optimize '.includes'
      continue
    }

    _currentContext = _parentContext.groups[val] as SubContext
    _cleanup()
    delete _parentContext.groups[val]
    _currentContext = _parentContext
  }

  _parentContext.lastVals = [...arr]

  for (let i = 0; i < arr.length; i++) {
    const val = arr[i] as string | number
    if (!_parentContext.groups[val]) {
      _parentContext.groups[val] = {
        effects: {},
        groups: {},
        effectIndex: 0,
        lastVals: undefined!
      } as SubContext
    }

    _currentContext = _parentContext.groups[val] as SubContext
    _currentContext.effectIndex = 0
    cb(val as T)
  }

  _currentContext = _parentContext
}

const runEffect = (cb: () => (() => void) | void, deps: Array<any>) => {
  const _parentContext = _currentContext
  if (!_parentContext) throw new Error('runEffect must be called within a context')

  const index = _parentContext.effectIndex
  _parentContext.effectIndex++

  if (!_parentContext.effects[index]) {
    _parentContext.effects[index] = {
      lastVals: undefined!,
      lastCallback: undefined
    } as Effect
  }

  const context = _parentContext.effects[index] as Effect

  if (!context.lastVals) {
    context.lastVals = [...deps]
    // run on initial mount
    context.lastCallback = cb() as () => void | undefined
    return
  } else {
    if (context.lastVals.length != deps.length) throw new Error('deps length must not change')
  }

  if (!deps.length) return

  const lastVals = context.lastVals

  for (let i = 0; i < lastVals.length; i++) {
    if (typeof lastVals[i] !== typeof deps[i] || lastVals[i] !== deps[i]) {
      if (context.lastCallback) context.lastCallback()
      context.lastCallback = cb() as () => void | undefined
      lastVals[i] = deps[i]
    }
  }
}

const Runner = { runContext, runGroup, runEffect }

export { Runner }
