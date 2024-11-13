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

import { FileThumbnailJobState } from '@ir-engine/client-core/src/common/services/FileThumbnailJobState'
import { PopoverState } from '@ir-engine/client-core/src/common/services/PopoverState'
import { uploadToFeathersService } from '@ir-engine/client-core/src/util/upload'
import { API, useFind } from '@ir-engine/common'
import config from '@ir-engine/common/src/config'
import {
  StaticResourceType,
  UserType,
  fileBrowserUploadPath,
  staticResourcePath
} from '@ir-engine/common/src/schema.type.module'
import { NO_PROXY, State, getMutableState, startReactor, useHookstate, useMutableState } from '@ir-engine/hyperflux'
import { Input } from '@ir-engine/ui'
import Button from '@ir-engine/ui/src/primitives/tailwind/Button'
import Modal from '@ir-engine/ui/src/primitives/tailwind/Modal'
import Text from '@ir-engine/ui/src/primitives/tailwind/Text'
import TextArea from '@ir-engine/ui/src/primitives/tailwind/TextArea'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { HiPencil, HiPlus, HiXMark } from 'react-icons/hi2'
import { RiSave2Line } from 'react-icons/ri'
import { FilesState, SelectedFilesState } from '../../../services/FilesState'
import { createFileDigest, createStaticResourceDigest } from '../helpers'
import FilePropertiesSaveConfirmationModal from './FilePropertiesSaveConfirmationModal'

export default function FilePropertiesModal() {
  const projectName = useMutableState(FilesState).projectName.value
  const files = useMutableState(SelectedFilesState).value

  const filesCount = files.length
  if (filesCount === 0) return null
  const { t } = useTranslation()

  const fileStaticResources = useHookstate<StaticResourceType[]>([])
  const fileDigest = createFileDigest(files)
  const resourceDigest = useHookstate<StaticResourceType>(createStaticResourceDigest([]))
  const sharedFields = useHookstate<string[]>([])
  const modifiedFields = useHookstate<string[]>([])
  const editedField = useHookstate<string | null>(null)
  const tagInput = useHookstate<string>('')
  const sharedTags = useHookstate<string[]>([])

  let title: string
  let filename: string
  if (filesCount === 1) {
    const firstFile = files[0]
    filename = firstFile.name
    title = t('editor:layout.filebrowser.fileProperties.header', { fileName: filename.toUpperCase() })
  } else {
    filename = t('editor:layout.filebrowser.fileProperties.mixedValues')
    title = t('editor:layout.filebrowser.fileProperties.header-plural', { itemCount: filesCount })
  }

  const onChange = (fieldName: string, state: State<string | undefined>) => {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (!modifiedFields.value.includes(fieldName)) {
        modifiedFields.set([...modifiedFields.value, fieldName])
      }
      state.set(e.target.value)
    }
  }

  const handleRegenerateThumbnail = () => {
    for (const resource of fileStaticResources.value) {
      getMutableState(FileThumbnailJobState).merge([
        {
          key: resource.url,
          project: resource.project!,
          id: resource.id
        }
      ])
    }
  }

  const handleSubmit = async () => {
    PopoverState.showPopupover(<FilePropertiesSaveConfirmationModal />)
    if (modifiedFields.value.length > 0) {
      const addedTags: string[] = resourceDigest.tags.value!.filter((tag) => !sharedTags.value.includes(tag))
      const removedTags: string[] = sharedTags.value!.filter((tag) => !resourceDigest.tags.value!.includes(tag))
      for (const resource of fileStaticResources.value) {
        const oldTags = resource.tags ?? []
        const newTags = Array.from(new Set([...addedTags, ...oldTags.filter((tag) => !removedTags.includes(tag))]))
        await API.instance.service(staticResourcePath).patch(resource.id, {
          key: resource.key,
          tags: newTags,
          name: resourceDigest.name.value,
          licensing: resourceDigest.licensing.value,
          attribution: resourceDigest.attribution.value,
          description: resourceDigest.description.value,
          project: resource.project
        })
      }
      const reactor = startReactor(() => {
        const updatedResources = useFind(staticResourcePath, {
          query: {
            key: {
              $like: undefined,
              $or: files.map(({ key }) => ({
                key
              }))
            },
            $limit: 10000
          }
        })
        for (const resource of updatedResources.data) {
          const oldTags = resource.tags ?? []
          const newTags = Array.from(new Set([...addedTags, ...oldTags.filter((tag) => !removedTags.includes(tag))]))
          if (
            resource.tags?.length === newTags.length &&
            resource.tags.every((val, index) => val === newTags[index]) &&
            resource.name === resourceDigest.name.value &&
            resource.licensing === resourceDigest.licensing.value &&
            resource.attribution === resourceDigest.attribution.value &&
            resource.description === resourceDigest.description.value
          ) {
            console.log('All properties successfully updated')
            modifiedFields.set([])
            PopoverState.hidePopupover()
            PopoverState.hidePopupover()
            reactor.stop()
          }
        }
        return null
      })
    } else {
      PopoverState.hidePopupover()
      PopoverState.hidePopupover()
    }
  }

  const resources = useFind(staticResourcePath, {
    query: {
      key: {
        $like: undefined,
        $or: files.map(({ key }) => ({
          key
        }))
      },
      $limit: 10000
    }
  })
  useEffect(() => {
    if (resources.data.length === 0) return
    API.instance
      .service('user')
      .get(resources.data[0].userId)
      .then((user) => author.set(user))

    fileStaticResources.set(resources.data)
    const digest = createStaticResourceDigest(resources.data)
    resourceDigest.set(digest)
    sharedFields.set(
      Object.keys(resourceDigest).filter((key) => {
        const value = resourceDigest[key]
        return value.length !== ''
      })
    )
    sharedTags.set(resourceDigest.tags.get(NO_PROXY)!.slice() as string[])
  }, [resources.data.length])

  const author = useHookstate<UserType | null>(null)

  const handleAddTag = () => {
    if (tagInput.value != '' && !resourceDigest.tags.value!.includes(tagInput.value)) {
      if (!modifiedFields.value.includes('tags')) {
        modifiedFields.set([...modifiedFields.value, 'tags'])
      }
      resourceDigest.tags.set([...resourceDigest.tags.value!, tagInput.value])
    }
    tagInput.set('')
  }

  const handleRemoveTag = (index: number) => {
    if (!modifiedFields.value.includes('tags')) {
      modifiedFields.set([...modifiedFields.value, 'tags'])
    }
    resourceDigest.tags.set(resourceDigest.tags.value!.filter((_, i) => i !== index))
  }

  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      for (const resource of resources.data) {
        const src = await uploadToFeathersService(fileBrowserUploadPath, [file], {
          args: [
            {
              fileName: file.name,
              project: projectName,
              path: 'public/thumbnails/' + file.name,
              contentType: file.type,
              type: 'thumbnail'
            }
          ]
        }).promise
        const thumbnailURL = new URL(src)
        thumbnailURL.search = ''
        thumbnailURL.hash = ''
        const _thumbnailKey = thumbnailURL.href.replace(config.client.fileServer + '/', '')
        API.instance.service(staticResourcePath).patch(resource.id, {
          thumbnailKey: _thumbnailKey,
          thumbnailMode: 'custom'
        })
      }
    }
  }

  return (
    <Modal
      title={title}
      className="w-[50vw] max-w-2xl"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitButtonText={t('editor:layout.filebrowser.fileProperties.save-changes')}
      closeButtonText={t('editor:layout.filebrowser.fileProperties.discard')}
    >
      <div className="flex flex-col items-center">
        {fileStaticResources.length === 1 && (
          <img
            src={resources.data[0].thumbnailURL}
            alt={resources.data[0].key}
            className="h-24 w-24 rounded-lg object-cover"
          />
        )}
        <Button
          title={t('editor:layout.filebrowser.fileProperties.regenerateThumbnail')}
          data-testid="files-panel-file-item-properties-regenerate-thumbnail-button"
          onClick={handleRegenerateThumbnail}
          className="mt-2 text-xs"
        >
          {t('editor:layout.filebrowser.fileProperties.regenerateThumbnail')}
        </Button>
        <div className="mt-1 rounded-md bg-blue-primary px-4 py-1 text-base">
          {/* Use a label to trigger the file input click, no ref needed */}
          <label className="mt-1 cursor-pointer text-xs">
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadThumbnail} // Directly attach the handler here
              className="hidden"
            />
            {/* Style the button to act as a proxy for the hidden input */}
            <span className="button">{t('editor:layout.filebrowser.fileProperties.uploadThumbnail')}</span>
          </label>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Text className="text-end">{t('editor:layout.filebrowser.fileProperties.fileName')}</Text>
          <Text className="text-theme-input" data-testid="files-panel-file-item-properties-file-name">
            {filename}
          </Text>
        </div>
        <div className="grid grid-cols-2 items-center gap-2">
          <Text className="text-end">{t('editor:layout.filebrowser.fileProperties.name')}</Text>
          <span className="flex items-center">
            {editedField.value === 'name' ? (
              <>
                <Input value={resourceDigest.name.value ?? ''} onChange={onChange('name', resourceDigest.name)} />
                <Button
                  title={t('common:components.save')}
                  variant="transparent"
                  size="small"
                  startIcon={<RiSave2Line />}
                  onClick={() => editedField.set(null)}
                />
              </>
            ) : (
              <>
                <Text className="text-theme-input">
                  {files.length > 1 && !sharedFields.value.includes('name')
                    ? t('editor:layout.filebrowser.fileProperties.mixedValues')
                    : resourceDigest.name.value || <em>{t('common:components.none')}</em>}
                </Text>
                <Button
                  title={t('common:components.edit')}
                  variant="transparent"
                  size="small"
                  startIcon={<HiPencil />}
                  onClick={() => editedField.set('name')}
                />
              </>
            )}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Text className="text-end">{t('editor:layout.filebrowser.fileProperties.type')}</Text>
          <Text className="text-theme-input" data-testid="files-panel-file-item-properties-file-type">
            {fileDigest.type.toUpperCase()}
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Text className="text-end">{t('editor:layout.filebrowser.fileProperties.size')}</Text>
          <Text className="text-theme-input" data-testid="files-panel-file-item-properties-file-size">
            {files.map((file) => file.size).reduce((total, value) => total + parseInt(value ?? '0'), 0)}
          </Text>
        </div>
        {fileStaticResources.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Text className="text-end">{t('editor:layout.filebrowser.fileProperties.author')}</Text>
              <Text className="text-theme-input">{author.value?.name}</Text>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Text className="text-end">{t('editor:layout.filebrowser.fileProperties.attribution')}</Text>
              <span className="flex items-center">
                {editedField.value === 'attribution' ? (
                  <>
                    <Input
                      value={resourceDigest.attribution.value ?? ''}
                      onChange={onChange('attribution', resourceDigest.attribution)}
                    />
                    <Button
                      title={t('common:components.save')}
                      variant="transparent"
                      size="small"
                      startIcon={<RiSave2Line />}
                      onClick={() => editedField.set(null)}
                    />
                  </>
                ) : (
                  <>
                    <Text className="text-theme-input">
                      {files.length > 1 && !sharedFields.value.includes('attribution')
                        ? t('editor:layout.filebrowser.fileProperties.mixedValues')
                        : resourceDigest.attribution.value || <em>{t('common:components.none')}</em>}
                    </Text>
                    <Button
                      title={t('common:components.edit')}
                      variant="transparent"
                      size="small"
                      startIcon={<HiPencil />}
                      onClick={() => editedField.set('attribution')}
                    />
                  </>
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Text className="text-end">{t('editor:layout.filebrowser.fileProperties.licensing')}</Text>
              <span className="flex items-center">
                {editedField.value === 'licensing' ? (
                  <>
                    <Input
                      value={resourceDigest.licensing.value ?? ''}
                      onChange={onChange('licensing', resourceDigest.licensing)}
                    />
                    <Button
                      title={t('common:components.save')}
                      variant="transparent"
                      size="small"
                      startIcon={<RiSave2Line />}
                      onClick={() => editedField.set(null)}
                    />
                  </>
                ) : (
                  <>
                    <Text className="text-theme-input">
                      {files.length > 1 && !sharedFields.value.includes('licensing')
                        ? t('editor:layout.filebrowser.fileProperties.mixedValues')
                        : resourceDigest.licensing.value || <em>{t('common:components.none')}</em>}
                    </Text>
                    <Button
                      title={t('common:components.edit')}
                      variant="transparent"
                      size="small"
                      startIcon={<HiPencil />}
                      onClick={() => editedField.set('licensing')}
                    />
                  </>
                )}
              </span>
            </div>
            <span className="flex flex-col items-start">
              <label className="mb-2">Description</label> {/* Assuming "Description" is your label */}
              {editedField.value === 'description' ? (
                <>
                  <TextArea
                    className="resize-vertical max-h-[20em] min-h-[5em] w-full overflow-y-auto rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={resourceDigest.description.value ?? ''}
                    onChange={onChange('description', resourceDigest.description)}
                    placeholder="Enter description here..."
                  />
                  <Button
                    title={t('common:components.save')}
                    variant="transparent"
                    size="small"
                    startIcon={<RiSave2Line />}
                    onClick={() => editedField.set(null)}
                    className="mt-2"
                  />
                </>
              ) : (
                <>
                  <Text className="block h-auto w-full overflow-auto whitespace-normal break-words text-theme-input">
                    {files.length > 1 && !sharedFields.value.includes('description')
                      ? t('editor:layout.filebrowser.fileProperties.mixedValues')
                      : resourceDigest.description.value || <em>{t('common:components.none')}</em>}
                  </Text>
                  <Button
                    title={t('common:components.edit')}
                    variant="transparent"
                    size="small"
                    startIcon={<HiPencil />}
                    onClick={() => editedField.set('description')}
                  />
                </>
              )}
            </span>
            <div className="mt-10 flex flex-col gap-2">
              <Text className="text-theme-gray3" fontSize="sm">
                {t('editor:layout.filebrowser.fileProperties.addTag')}
              </Text>
              <div className="flex items-center gap-2">
                <Input
                  value={tagInput.value}
                  onChange={(event) => tagInput.set(event.target.value)}
                  onKeyUp={(event) => {
                    if (event.key === 'Enter') {
                      handleAddTag()
                    }
                  }}
                />
                <Button
                  startIcon={<HiPlus />}
                  title={t('editor:layout.filebrowser.fileProperties.add')}
                  onClick={handleAddTag}
                />
              </div>
              <div className="flex h-24 flex-wrap gap-2 overflow-y-auto bg-theme-surfaceInput p-2">
                {resourceDigest.tags.value!.map((tag, idx) => (
                  <span key={idx} className="flex h-fit w-fit items-center rounded bg-[#2C2E33] px-2 py-0.5">
                    {tag} <HiXMark className="ml-1 cursor-pointer" onClick={() => handleRemoveTag(idx)} />
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  )
}
