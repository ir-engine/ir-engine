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

import multiLogger from '@ir-engine/common/src/logger'
import fetch from 'node-fetch'
import config from '../../appconfig'

const logger = multiLogger.child({ component: 'server-core:ip-geolocation' })

/**
 * Interface for ipinfo.io API response
 */
export interface IpInfoResponse {
  ip: string
  country: string
  country_code: string
  continent: string
  continent_code: string
  city?: string
  region?: string
  loc?: string
  org?: string
  postal?: string
  timezone?: string
}

/**
 * Get country name from IP address using ipinfo.io API
 * @param ipAddress IP address to lookup
 * @returns Full country name or undefined if lookup fails
 */
export const getCountryFromIP = async (ipAddress: string | undefined): Promise<string | undefined> => {
  if (!ipAddress || ipAddress === '::1' || ipAddress === 'localhost') {
    return 'Local System'
  }

  try {
    // Get IP geolocation settings from server config
    const { apiUrl, apiToken } = config.server.ipGeolocation

    const response = await fetch(`${apiUrl}/${ipAddress}?token=${apiToken}`)

    if (!response.ok) {
      logger.error(`Error fetching country from IP: ${response.statusText}`)
      return undefined
    }

    const data = (await response.json()) as IpInfoResponse

    // ipinfo.io directly provides the full country name
    return data.country || undefined
  } catch (error) {
    logger.error('Error fetching country from IP:', error)
    return undefined
  }
}
