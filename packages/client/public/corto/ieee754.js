
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


/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
    let e, m
    const eLen = (nBytes * 8) - mLen - 1
    const eMax = (1 << eLen) - 1
    const eBias = eMax >> 1
    let nBits = -7
    let i = isLE ? (nBytes - 1) : 0
    const d = isLE ? -1 : 1
    let s = buffer[offset + i]
  
    i += d
  
    e = s & ((1 << (-nBits)) - 1)
    s >>= (-nBits)
    nBits += eLen
    while (nBits > 0) {
      e = (e * 256) + buffer[offset + i]
      i += d
      nBits -= 8
    }
  
    m = e & ((1 << (-nBits)) - 1)
    e >>= (-nBits)
    nBits += mLen
    while (nBits > 0) {
      m = (m * 256) + buffer[offset + i]
      i += d
      nBits -= 8
    }
  
    if (e === 0) {
      e = 1 - eBias
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen)
      e = e - eBias
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }
  
  exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
    let e, m, c
    let eLen = (nBytes * 8) - mLen - 1
    const eMax = (1 << eLen) - 1
    const eBias = eMax >> 1
    const rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
    let i = isLE ? 0 : (nBytes - 1)
    const d = isLE ? 1 : -1
    const s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0
  
    value = Math.abs(value)
  
    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0
      e = eMax
    } else {
      e = Math.floor(Math.log(value) / Math.LN2)
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--
        c *= 2
      }
      if (e + eBias >= 1) {
        value += rt / c
      } else {
        value += rt * Math.pow(2, 1 - eBias)
      }
      if (value * c >= 2) {
        e++
        c /= 2
      }
  
      if (e + eBias >= eMax) {
        m = 0
        e = eMax
      } else if (e + eBias >= 1) {
        m = ((value * c) - 1) * Math.pow(2, mLen)
        e = e + eBias
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
        e = 0
      }
    }
  
    while (mLen >= 8) {
      buffer[offset + i] = m & 0xff
      i += d
      m /= 256
      mLen -= 8
    }
  
    e = (e << mLen) | m
    eLen += mLen
    while (eLen > 0) {
      buffer[offset + i] = e & 0xff
      i += d
      e /= 256
      eLen -= 8
    }
  
    buffer[offset + i - d] |= s * 128
  }