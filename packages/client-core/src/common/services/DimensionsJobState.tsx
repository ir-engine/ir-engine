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

import { API, useFind } from '@ir-engine/common'
import { FileBrowserContentType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import { Entity, getComponent, setComponent } from '@ir-engine/ecs'
import { NO_PROXY, defineState, getMutableState, useHookstate } from '@ir-engine/hyperflux'
import {
  BoundingBoxComponent,
  updateBoundingBox
} from '@ir-engine/spatial/src/transform/components/BoundingBoxComponents'
import React, { useEffect } from 'react'
import { extensionCanHaveThumbnail, extensionThumbnailTypeMap, stripSearchFromURL } from './FileThumbnailJobState'
type DimensionJob = {
  key: string
  project: string // the project name
  id: string // the existing static resource ID
}
const seenResources = new Set<string>()
export const DimensionsJobState = defineState({
  name: 'DimensionsJobState',
  initial: [] as DimensionJob[],
  reactor: () => <DimensionsJobReactor />,
  removeCurrentJob: () => {
    const jobState = getMutableState(DimensionsJobState)
    jobState.set((prev) => {
      prev.splice(0, 1)
      return prev
    })
  },
  useGenerateDimensions: async (files: readonly FileBrowserContentType[]) => {
    const resourceQuery = useFind(staticResourcePath, {
      query: {
        key: {
          $in: files.map((file) => file.key).filter((key) => !seenResources.has(key))
        },
        dimensions: 'null'
      }
    })

    /**
     * This useEffect will continuously check for new resources that need dimensions generated until all resources have dimensions
     */
    useEffect(() => {
      for (const resource of resourceQuery.data) {
        if (seenResources.has(resource.key)) continue
        seenResources.add(resource.key)

        if (resource.type === 'asest') {
          API.instance
            .service(staticResourcePath)
            .patch(resource.id, { thumbnailKey: resource.key, project: resource.project })
          continue
        }

        if (resource.thumbnailKey != null || !extensionCanHaveThumbnail(resource.key.split('.').pop() ?? '')) continue

        getMutableState(DimensionsJobState).merge([
          {
            key: resource.url,
            project: resource.project!,
            id: resource.id
          }
        ])
      }

      // If there are more files left to be processed in the list we have specified, refetch the query
      if (resourceQuery.total > resourceQuery.data.length) resourceQuery.refetch()
    }, [resourceQuery.data])
  }
})
const uploadDimension = async (
  gltfEntity: Entity,
  projectName: string,
  staticResourceId: string,
  blob: Blob | null
) => {
  // add model
  //calculate the dimensions of the model
  setComponent(gltfEntity, BoundingBoxComponent)
  updateBoundingBox(gltfEntity)
  const boundingBox = getComponent(gltfEntity, BoundingBoxComponent).box
  const dimensions_x = boundingBox.max.x - boundingBox.min.x
  const dimensions_y = boundingBox.max.y - boundingBox.min.y
  const dimensions_z = boundingBox.max.z - boundingBox.min.z
  const dimensionsData = [dimensions_x, dimensions_y, dimensions_z]
  await API.instance
    .service(staticResourcePath)
    .patch(staticResourceId, { dimensions: dimensionsData, project: projectName })
}

const DimensionsJobReactor = () => {
  const jobState = useHookstate(getMutableState(DimensionsJobState))
  const currentJob = useHookstate(null as DimensionJob | null)
  const { key: src, project, id } = currentJob.value ?? { key: '', project: '', id: '' }
  const strippedSrc = stripSearchFromURL(src)
  let extension = strippedSrc
  if (strippedSrc.endsWith('.material.gltf')) {
    extension = 'material.gltf'
  } else if (strippedSrc.endsWith('.lookdev.gltf')) {
    extension = 'lookdev.gltf'
  } else {
    extension = strippedSrc.split('.').pop() ?? ''
  }
  const fileType = extensionThumbnailTypeMap.get(extension)

  const onError = (err) => {
    console.error('failed to generate thumbnail for', src)
    console.error(err)
    DimensionsJobState.removeCurrentJob()
  }

  useEffect(() => {
    if (jobState.length > 0) {
      const newJob = jobState[0].get(NO_PROXY)
      currentJob.set(JSON.parse(JSON.stringify(newJob)))
    } else {
      currentJob.set(null)
    }
  }, [jobState.length])

  return fileType && currentJob.value ? <>{uploadDimension()}</> : null
}
