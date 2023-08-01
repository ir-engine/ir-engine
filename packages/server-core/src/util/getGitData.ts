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

/**
 * adapted from https://github.com/soldair/node-gitconfiglocal
 */
import fs from 'fs'
import ini from 'ini'

import logger from '../ServerLogger'

export interface GitConfigData {
  core: {
    repositoryformatversion: number
    filemode: boolean
    bare: boolean
    logallrefupdates: boolean
  }
  remote: {
    [remote: string]: {
      url: string
      fetch: string
    }
  }
  branch: {
    [branch: string]: {
      remote: string
      merge: string
    }
  }
}

export function getGitHeadData(dir: string): string | undefined {
  dir = dir + '/HEAD'

  if (!fs.existsSync(dir)) {
    logger.warn('[Projects]: Could not find git HEAD file at: ' + dir)
    return null!
  }
  const data = fs.readFileSync(dir)
  try {
    return data.toString().split(':')[1].trim().split('/').pop()
  } catch (e) {
    logger.error(e, `Error getting git HEAD data: ${e.message}`)
  }
  return null!
}

export function getGitOrigHeadData(dir: string, branch: string | undefined): string | undefined {
  const origDir = dir + '/ORIG_HEAD'

  if (!fs.existsSync(origDir)) {
    logger.warn('[Projects]: Could not find git ORIG_HEAD file at: ' + origDir)
    return getGitPackedRefsData(dir, branch)
  }

  const data = fs.readFileSync(origDir)
  try {
    return data.toString().trim()
  } catch (e) {
    logger.error(e, `Error getting git ORIG_HEAD data: ${e.message}`)
  }
  return null!
}

function getGitPackedRefsData(dir: string, branch: string | undefined): string | undefined {
  dir = dir + '/packed-refs'

  if (!fs.existsSync(dir)) {
    logger.warn('[Projects]: Could not find git packed-refs file at: ' + dir)
    return null!
  }
  if (!branch) {
    logger.warn('[Projects]: Branch is empty. Could use git packed-refs file at: ' + dir)
    return null!
  }

  const data = fs.readFileSync(dir)
  try {
    const content = data.toString().trim().split('\n')
    const branchLine = content.find((line) => line.endsWith(branch))
    return branchLine?.split(' ')[0]
  } catch (e) {
    logger.error(e, `Error getting git packed-refs data: ${e.message}`)
  }
  return null!
}

export function getGitConfigData(dir: string): GitConfigData {
  dir = dir + '/config'

  if (!fs.existsSync(dir)) {
    logger.warn('[Projects]: Could not find git config file at: ' + dir)
    return null!
  }
  const data = fs.readFileSync(dir)
  try {
    return format(ini.parse(data.toString())) as GitConfigData
  } catch (e) {
    logger.error(e, `Error getting git config data: ${e.message}`)
  }
  return null!
}

function format(data) {
  const out = {}
  Object.keys(data).forEach(function (k) {
    if (k.indexOf('"') > -1) {
      const parts = k.split('"')
      const parentKey = parts.shift()!.trim()
      const childKey = parts.shift()!.trim()
      if (!out[parentKey]) out[parentKey] = {}
      out[parentKey][childKey] = data[k]
    } else {
      //@ts-ignore
      out[k] = merge(out[k], data[k])
      // cant start using these without bumping the major
      //out[k] = {...out[k], ...data[k]};
    }
  })
  return out
}

function merge() {
  const a = {}
  for (let i = arguments.length; i >= 0; --i) {
    // eslint-disable-next-line prefer-rest-params
    Object.keys(arguments[i] || {}).forEach((k) => {
      // eslint-disable-next-line prefer-rest-params
      a[k] = arguments[i][k]
    })
  }
  return a
}
