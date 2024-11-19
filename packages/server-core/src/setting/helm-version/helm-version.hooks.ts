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

import { HookContext } from '@feathersjs/feathers'
import { BUILDER_CHART_REGEX, MAIN_CHART_REGEX } from '@ir-engine/common/src/regex'
import fetch from 'node-fetch'

const fetchHelmVersions = async (action: 'main' | 'builder'): Promise<string[]> => {
  const regex = action === 'main' ? MAIN_CHART_REGEX : BUILDER_CHART_REGEX
  const versions: string[] = []

  const response = await fetch('https://helm.etherealengine.org')
  const chart = Buffer.from(await response.arrayBuffer()).toString()

  const matches = chart.matchAll(regex)

  for (const match of matches) {
    if (match && !versions.includes(match[1])) {
      versions.push(match[1])
    }
  }

  return versions
}

const fetchHelmVersion = async (context: HookContext) => {
  const { action } = context.params.query

  if (!action || (action !== 'main' && action !== 'builder')) {
    throw new Error(`Invalid action parameter. Expected 'main' or 'builder', received '${action}'`)
  }

  const versions = await fetchHelmVersions(action)

  context.result = versions
  return context
}

export default {
  before: {
    all: [],
    find: [fetchHelmVersion]
  },
  after: {
    all: [],
    find: []
  },
  error: {
    all: [],
    find: []
  }
}
