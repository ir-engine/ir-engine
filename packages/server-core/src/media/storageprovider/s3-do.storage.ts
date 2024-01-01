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

import { FunctionSummary } from '@aws-sdk/client-cloudfront'

import S3Provider from './s3.storage'

const MAX_ITEMS = 1
const CFFunctionTemplate = `
function handler(event) {
    var request = event.request;
    var routeRegexRoot = __$routeRegex$__
    var routeRegex = new RegExp(routeRegexRoot)
    var publicRegexRoot = __$publicRegex$__
    var publicRegex = new RegExp(publicRegexRoot)

    if (routeRegex.test(request.uri)) {
        request.uri = '/client/index.html'
    }
    
    if (publicRegex.test(request.uri)) {
        request.uri = '/client' + request.uri
    }
    return request;
}
`

/**
 * Storage provide class to communicate with AWS S3 API.
 */
export class S3DOProvider extends S3Provider {
  constructor() {
    super()
    this.bucketAssetURL = 'https://etherealengine-static-resources.sfo2.digitaloceanspaces.com'
  }
  /**
   * Invalidate items in the S3 storage.
   * @param invalidationItems List of keys.
   */
  override async createInvalidation(invalidationItems: string[]) {
    return undefined
  }

  override async getOriginURLs(): Promise<string[]> {
    return [this.cacheDomain]
  }

  override async listFunctions(marker: string | null, functions: FunctionSummary[]): Promise<FunctionSummary[]> {
    return []
  }

  async createFunction(functionName: string, routes: string[]) {
    return undefined
  }

  async associateWithFunction(functionARN: string, attempts = 1) {
    return undefined
  }

  async publishFunction(functionName: string) {
    return undefined
  }

  async updateFunction(functionName: string, routes: string[]) {
    return undefined
  }
}

export default S3DOProvider
