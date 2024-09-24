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

import { API } from '@ir-engine/common'

/**
 * Recursively checks a boolean state with logarithmic backoff.
 * @param checkFunction A function that returns a boolean indicating if the desired state is reached.
 * @param maxAttempts Maximum number of attempts before giving up.
 * @param initialDelay Initial delay in milliseconds.
 * @param maxDelay Maximum delay in milliseconds.
 * @returns A promise that resolves to true if the desired state is reached, false otherwise.
 */
async function logarithmicStateCheck(
  checkFunction: () => boolean,
  maxAttempts: number = 5,
  initialDelay: number = 1000,
  maxDelay: number = 30000
): Promise<boolean> {
  let attempts = 0
  let delay = initialDelay

  async function attemptCheck(): Promise<boolean> {
    if (checkFunction()) {
      console.log(`Succeeded to reach desired state after ${attempts} attempts.`)
      return true
    }

    attempts++
    if (attempts >= maxAttempts) {
      console.log(`Failed to reach desired state after ${maxAttempts} attempts.`)
      return false
    }

    console.log(`Attempt ${attempts} failed. Retrying in ${delay}ms...`)
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Increase delay logarithmically, but cap it at maxDelay
    delay = Math.min(delay * 2, maxDelay)

    return attemptCheck()
  }

  return attemptCheck()
}

async function waitForClientAuthenticated(): Promise<void> {
  const api = API.instance // as FeathersClient
  console.log('Client authenticated?', api?.authentication?.authenticated)
  // Reference to `api` gets fixed on initial value inside checkFunction, so need to reference API.instance directly
  await logarithmicStateCheck(() => API.instance?.authentication?.authenticated === true, Infinity, 1000, 16 * 1000)
  console.log('Client authenticated?', api?.authentication?.authenticated)
}

export default waitForClientAuthenticated
