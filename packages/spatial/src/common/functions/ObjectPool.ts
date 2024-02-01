/**
Adapted from https://github.com/getify/deePool/blob/master/src/deePool.js

Copyright (c) 2021 Kyle Simpson <getify@gmail.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
 */

const EMPTY_SLOT = Object.freeze(Object.create(null))

export function createObjectPool<T>(objectFactory: () => T, autoGrow = false) {
  const objPool = [] as T[]
  let nextFreeSlot = null! as number // pool location to look for a free object to use

  return {
    use,
    recycle,
    grow,
    size,
    objPool
  }

  // ******************************

  function use() {
    if (nextFreeSlot == null || nextFreeSlot == objPool.length) {
      if (autoGrow) grow(objPool.length || 5)
    }

    let objToUse = objPool[nextFreeSlot]
    if (objToUse) objPool[nextFreeSlot++] = EMPTY_SLOT
    return objToUse
  }

  function recycle(obj: T) {
    if (nextFreeSlot == null || nextFreeSlot == -1) {
      objPool[objPool.length] = obj
    } else {
      objPool[--nextFreeSlot] = obj
    }
  }

  function grow(count = objPool.length) {
    if (count > 0 && nextFreeSlot == null) {
      nextFreeSlot = 0
    }

    if (count > 0) {
      let curLen = objPool.length
      objPool.length += Number(count)

      for (let i = curLen; i < objPool.length; i++) {
        // add new obj to pool
        objPool[i] = objectFactory()
      }
    }

    return objPool.length
  }

  function size() {
    return objPool.length
  }
}
