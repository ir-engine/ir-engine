/**
 * adapted from https://github.com/soldair/node-gitconfiglocal
 */

import fs from 'fs'
import ini from 'ini'

export interface GitData {
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

export function getGitData(dir): GitData {
  if (!fs.existsSync(dir)) {
    console.log('[Projects]: Could not find git config file at', dir)
    return
  }
  const data = fs.readFileSync(dir)
  try {
    var formatted = format(ini.parse(data.toString()))
  } catch (e) {
    console.log(e)
  }
  return formatted as GitData
}

function format(data) {
  var out = {}
  Object.keys(data).forEach(function (k) {
    if (k.indexOf('"') > -1) {
      var parts = k.split('"')
      var parentKey = parts.shift().trim()
      var childKey = parts.shift().trim()
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
  var a = {}
  for (var i = arguments.length; i >= 0; --i) {
    Object.keys(arguments[i] || {}).forEach((k) => {
      a[k] = arguments[i][k]
    })
  }
  return a
}
