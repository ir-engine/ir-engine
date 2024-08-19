
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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/


const { register } = require('trace-unhandled')
register()

require("ts-node").register({
  project: "./tsconfig.json",
})

process.on('warning', e => console.warn(e.stack));

process.on('SIGTERM', async (err) => {
  console.log('[Infinite Reality Engine Tests]: Server SIGTERM')
  console.log(err)
})
process.on('SIGINT', () => {
  console.log('[Infinite Reality Engine Tests]: RECEIVED SIGINT')
  process.exit()
})

//emitted when an uncaught JavaScript exception bubbles
process.on('uncaughtException', (err) => {
  console.log('[Infinite Reality Engine Tests]: UNCAUGHT EXCEPTION')
  console.log(err)
  process.exit()
})

//emitted whenever a Promise is rejected and no error handler is attached to it
process.on('unhandledRejection', (reason, p) => {
  console.log('[Infinite Reality Engine Tests]: UNHANDLED REJECTION')
  console.log(reason)
  console.log(p)
  process.exit()
})