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
