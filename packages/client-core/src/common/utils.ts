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

import { AudioEffectPlayer } from '@ir-engine/engine/src/audio/systems/MediaSystem'

export const handleSoundEffect = () => {
  AudioEffectPlayer.instance.play(AudioEffectPlayer.SOUNDS.ui)
}

export const isValidHttpUrl = (urlString) => {
  let url

  try {
    url = new URL(urlString)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

export const getCanvasBlob = (
  canvas: HTMLCanvasElement,
  fileType = 'image/png',
  quality = 0.9
): Promise<Blob | null> => {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, fileType, quality))
}

/**
 * Extracts the subdomain from a given URL.
 * Returns undefined if no subdomain is found or if it's 'www'.
 *
 * @param url The URL to extract the subdomain from
 * @returns The subdomain or undefined
 */
export function getSubdomain(url: string): string | undefined {
  // Remove protocol (http, https, etc.) if present
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '')

  // Split the remaining string by dots
  const parts = cleanUrl.split('.')

  // If we have more than 2 parts (subdomain.domain.tld), return the first part
  if (parts.length > 2) {
    const subdomain = parts[0]
    // Return undefined if the subdomain is 'www' or empty
    return subdomain === 'www' || subdomain === '' ? undefined : subdomain
  }

  // If we don't have a subdomain, return undefined
  return undefined
}
