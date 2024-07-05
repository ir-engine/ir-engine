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

import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { PopoverState } from '@etherealengine/client-core/src/common/services/PopoverState'
import {
  StaticResourceType,
  UserType,
  fileBrowserPath,
  staticResourcePath
} from '@etherealengine/common/src/schema.type.module'
import { Engine } from '@etherealengine/ecs'
import { FileDataType } from '@etherealengine/editor/src/components/assets/FileBrowser/FileDataType'
import { EditorState } from '@etherealengine/editor/src/services/EditorServices'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { useFind, useMutation } from '@etherealengine/spatial/src/common/functions/FeathersHooks'
import { HiPencil, HiPlus, HiXMark } from 'react-icons/hi2'
import { RiSave2Line } from 'react-icons/ri'
import Button from '../../../../../primitives/tailwind/Button'
import Input from '../../../../../primitives/tailwind/Input'
import Modal from '../../../../../primitives/tailwind/Modal'
import Text from '../../../../../primitives/tailwind/Text'

export default function FilePropertiesModal({ projectName, file }: { projectName: string; file: FileDataType }) {
  const { t } = useTranslation()
  const newFileName = useHookstate(file.name)
  const fileService = useMutation(fileBrowserPath)

  const handleSubmit = async () => {
    fileService.update(null, {
      oldProject: projectName,
      newProject: projectName,
      oldName: file.fullName,
      newName: file.isFolder ? newFileName.value : `${newFileName.value}.${file.type}`,
      oldPath: file.path,
      newPath: file.path,
      isCopy: false
    })
    PopoverState.hidePopupover()
  }

  const staticResource = useFind(staticResourcePath, {
    query: {
      key: file.key,
      project: getMutableState(EditorState).projectName.value!
    }
  })

  const staticResourceMutation = useMutation(staticResourcePath)

  const resourceProperties = useHookstate({
    id: '',
    project: '',
    author: null as UserType | null,
    tags: {
      input: '',
      all: [] as string[]
    },
    attribution: {
      editing: false,
      input: ''
    },
    licensing: {
      editing: false,
      input: ''
    }
  })

  useEffect(() => {
    if (staticResource.data.length > 0) {
      if (staticResource.data.length > 1) console.info('Multiple resources with same key found')
      const resources = JSON.parse(JSON.stringify(staticResource.data[0])) as StaticResourceType
      if (resources) {
        Engine.instance.api
          .service('user')
          .get(resources.userId)
          .then((user) => resourceProperties.author.set(user))
        resourceProperties.id.set(resources.id)
        resourceProperties.project.set(resources.project ?? '')
        resourceProperties.tags.all.set(resources.tags ?? [])
        resourceProperties.attribution.input.set(resources.attribution ?? '')
        resourceProperties.licensing.input.set(resources.licensing ?? '')
      }
    }
  }, [staticResource.data])

  const handleAddTag = () => {
    const newTags = [...resourceProperties.tags.all.value, resourceProperties.tags.input.value]
    staticResourceMutation.patch(resourceProperties.id.value, {
      tags: newTags
    })
    resourceProperties.tags.input.set('')
    resourceProperties.tags.all.set(newTags)
  }

  const handleRemoveTag = (removedTag: string) => {
    const currentTags = resourceProperties.tags.all.value.filter((tag) => tag !== removedTag)
    staticResourceMutation.patch(resourceProperties.id.value, {
      tags: currentTags
    })
    resourceProperties.tags.all.set(currentTags)
  }

  return (
    <Modal
      title={t('editor:layout.filebrowser.fileProperties.header', { fileName: file.name.toUpperCase() })}
      className="w-96"
      onSubmit={handleSubmit}
      onClose={PopoverState.hidePopupover}
      submitButtonText={t('editor:layout.filebrowser.fileProperties.save-changes')}
      closeButtonText={t('editor:layout.filebrowser.fileProperties.discard')}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Text fontFamily="Figtree" className="text-end">
            {t('editor:layout.filebrowser.fileProperties.name')}
          </Text>
          <Text fontFamily="Figtree" className="text-[#9CA0AA]">
            {file.name}
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Text fontFamily="Figtree" className="text-end">
            {t('editor:layout.filebrowser.fileProperties.type')}
          </Text>
          <Text fontFamily="Figtree" className="text-[#9CA0AA]">
            {file.type.toUpperCase()}
          </Text>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Text fontFamily="Figtree" className="text-end">
            {t('editor:layout.filebrowser.fileProperties.size')}
          </Text>
          <Text fontFamily="Figtree" className="text-[#9CA0AA]">
            {file.size}
          </Text>
        </div>
        {resourceProperties.id.value && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Text fontFamily="Figtree" className="text-end">
                {t('editor:layout.filebrowser.fileProperties.author')}
              </Text>
              <Text fontFamily="Figtree" className="text-[#9CA0AA]">
                {resourceProperties.author.value?.name}
              </Text>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Text fontFamily="Figtree" className="text-end">
                {t('editor:layout.filebrowser.fileProperties.attribution')}
              </Text>
              <span className="flex items-center">
                {resourceProperties.attribution.editing.value ? (
                  <>
                    <Input
                      value={resourceProperties.attribution.input.value}
                      onChange={(event) => resourceProperties.attribution.input.set(event.target.value)}
                    />
                    <Button
                      title={t('common:components.save')}
                      variant="transparent"
                      size="small"
                      startIcon={<RiSave2Line />}
                      onClick={() => resourceProperties.attribution.editing.set(false)}
                    />
                  </>
                ) : (
                  <>
                    <Text fontFamily="Figtree" className="text-[#9CA0AA]">
                      {resourceProperties.attribution.input.value || <em>{t('common:components.none')}</em>}
                    </Text>
                    <Button
                      title={t('common:components.edit')}
                      variant="transparent"
                      size="small"
                      startIcon={<HiPencil />}
                      onClick={() => {
                        resourceProperties.attribution.editing.set(true)
                        staticResourceMutation.patch(resourceProperties.id.value, {
                          attribution: resourceProperties.attribution.input.value
                        })
                      }}
                    />
                  </>
                )}
              </span>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Text fontFamily="Figtree" className="text-end">
                {t('editor:layout.filebrowser.fileProperties.licensing')}
              </Text>
              <span className="flex items-center">
                {resourceProperties.licensing.editing.value ? (
                  <>
                    <Input
                      value={resourceProperties.licensing.input.value}
                      onChange={(event) => resourceProperties.licensing.input.set(event.target.value)}
                    />
                    <Button
                      title={t('common:components.save')}
                      variant="transparent"
                      size="small"
                      startIcon={<RiSave2Line />}
                      onClick={() => resourceProperties.licensing.editing.set(false)}
                    />
                  </>
                ) : (
                  <>
                    <Text fontFamily="Figtree" className="text-[#9CA0AA]">
                      {resourceProperties.licensing.input.value || <em>{t('common:components.none')}</em>}
                    </Text>
                    <Button
                      title={t('common:components.edit')}
                      variant="transparent"
                      size="small"
                      startIcon={<HiPencil />}
                      onClick={() => {
                        resourceProperties.licensing.editing.set(true)
                        staticResourceMutation.patch(resourceProperties.id.value, {
                          licensing: resourceProperties.licensing.input.value
                        })
                      }}
                    />
                  </>
                )}
              </span>
            </div>
            <div className="mt-10 flex flex-col gap-2">
              <Text fontFamily="Figtree" className="text-[#D3D5D9]" fontSize="sm">
                {t('editor:layout.filebrowser.fileProperties.addTag')}
              </Text>
              <div className="flex items-center gap-2">
                <Input
                  value={resourceProperties.tags.input.value}
                  onChange={(event) => resourceProperties.tags.input.set(event.target.value)}
                  onKeyUp={(event) => event.key === 'Enter' && handleAddTag()}
                />
                <Button
                  startIcon={<HiPlus />}
                  title={t('editor:layout.filebrowser.fileProperties.add')}
                  onClick={handleAddTag}
                />
              </div>
              <div className="flex h-24 flex-wrap gap-2 overflow-y-auto bg-theme-surfaceInput p-2">
                {resourceProperties.tags.all.value.map((tag, idx) => (
                  <span key={idx} className="flex h-fit w-fit items-center rounded bg-[#2F3137] px-2 py-0.5">
                    {tag} <HiXMark className="ml-1 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
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
