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

import { ImmutableArray } from '@hookstate/core'
import { StaticResourceType, UserID } from '@ir-engine/common/src/schema.type.module'
import { CommonKnownContentTypes } from '@ir-engine/common/src/utils/CommonKnownContentTypes'
import { FileDataType } from '../../components/assets/FileBrowser/FileDataType'

export const createFileDigest = (files: ImmutableArray<FileDataType>): FileDataType => {
  const digest: FileDataType = {
    key: '',
    path: '',
    name: '',
    fullName: '',
    url: '',
    type: '',
    isFolder: false
  }
  for (const key in digest) {
    const allValues = new Set(files.map((file) => file[key]))
    if (allValues.size === 1) {
      digest[key] = Array.from(allValues).pop()
    }
  }
  return digest
}

export const createStaticResourceDigest = (staticResources: ImmutableArray<StaticResourceType>): StaticResourceType => {
  const digest: StaticResourceType = {
    id: '',
    key: '',
    mimeType: '',
    hash: '',
    type: '',
    project: '',
    // dependencies: '',
    attribution: '',
    licensing: '',
    description: '',
    // stats: '',
    thumbnailKey: '',
    thumbnailMode: '',
    updatedBy: '' as UserID,
    createdAt: '',
    updatedAt: '',

    url: '',
    userId: '' as UserID
  }
  for (const key in digest) {
    const allValues = new Set(staticResources.map((resource) => resource[key]))
    if (allValues.size === 1) {
      digest[key] = Array.from(allValues).pop()
    }
  }
  const allTags: string[] = Array.from(new Set(staticResources.flatMap((resource) => resource.tags))).filter(
    (tag) => tag != null
  ) as string[]
  const commonTags = allTags.filter((tag) => staticResources.every((resource) => resource.tags?.includes(tag)))
  digest.tags = commonTags
  return digest
}

export function fileConsistsOfContentType(files: readonly FileDataType[], contentType: string): boolean {
  return files.every((file) => {
    if (file.isFolder) {
      return contentType.startsWith('image')
    } else {
      const guessedType: string = CommonKnownContentTypes[file.type]
      return guessedType?.startsWith(contentType)
    }
  })
}
