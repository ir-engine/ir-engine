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

export default function eventToMessage(event) {
  if (!event) return ''
  if (event.message) return event.message
  const target = event.target
  if (target) {
    if (event.target.error && event.target.error.message) return target.error.message
    if (event.target.src) return `Failed to load "${target.src}"`
    if (target instanceof XMLHttpRequest) {
      return `Network Error: ${target.status || 'Unknown Status.'} ${
        target.statusText || 'Unknown Error. Possibly a CORS error.'
      }`
    }
    return `Unknown error on ${target}.`
  }
  return `Unknown error: "${JSON.stringify(event)}"`
}
// Base error class to be used for all custom errors.
export class BaseError extends Error {
  constructor(message) {
    super(message)
    this.name = this.constructor.name
    this.message = message
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor)
    } else {
      this.stack = new Error(message).stack
    }
  }
}
// Override the message of an error but append the existing stack trace.
export class RethrownError extends BaseError {
  originalError
  constructor(message, error) {
    super(`${message}:\n  Cause:\n    ${eventToMessage(error).replace(/\n/g, '\n    ')}`)
    this.originalError = error
    this.stack += '\n' + error.stack
  }
}
// Output messages for multiple errors.
//
// Example: new MultiError("Error loading project", errors);
// Output:
//  Error loading project:
//
//  2 Errors:
//    Model "Example Model" could not be loaded:
//      Cause:
//        Network Error: Unknown error. Possibly caused by improper CORS headers.
//    Image "Example Image" could not be loaded.
//      Network Error: 404 Page not found.
export class MultiError extends BaseError {
  constructor(message, errors) {
    let finalMessage = `${message}:\n\n${errors.length} Error${errors.length > 1 ? 's' : ''}:`
    for (const error of errors) {
      const errorMessage = error.message ? error.message.replace(/\n/g, '\n  ') : 'Unknown Error'
      finalMessage += '\n  ' + errorMessage
    }
    super(finalMessage)
  }
}
