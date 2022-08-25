import * as fs from 'fs'
import { isEqual } from 'lodash'
import mime from 'mime-types'
import path from 'path'

export const getContentType = (url: string): string => {
  return mime.lookup(url) || 'application/octet-stream'
}

export type DirectorySnapshot = {
  modified: number
  files: {
    uri: string
    modified: number
  }[]
}

export function snapshot(directory: string): DirectorySnapshot {
  let dirModified = 0
  const files = fs.readdirSync(directory).map((file) => {
    const uri = path.join(directory, file)
    const stat = fs.statSync(uri)
    const modified = stat.mtime.getDate()
    dirModified = Math.max(dirModified, modified)
    return { uri, modified }
  })
  return {
    modified: dirModified,
    files
  }
}

export function delta(shot1: DirectorySnapshot, shot2: DirectorySnapshot): DirectorySnapshot {
  return {
    modified: shot2.modified,
    files: shot2.files.filter((file) => !shot1.files.find((oldFile) => isEqual(file, oldFile)))
  }
}
