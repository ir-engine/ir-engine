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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025 
Infinite Reality Engine. All Rights Reserved.
*/

import type { HookContext } from '@feathersjs/feathers'
import { resolve, virtual } from '@feathersjs/schema'
import {
  StaticResourceVectorData,
  StaticResourceVectorPatch,
  StaticResourceVectorQuery,
  StaticResourceVectorType
} from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { fromDateTimeSql, getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { v4 as uuidv4 } from 'uuid'
import type { Application } from '../../../declarations'

export const staticResourceVectorResolver = resolve<StaticResourceVectorType, HookContext<Application>>({
  // Convert vector strings back to arrays for external use
  captionEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  descriptionEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  tagsEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  materialEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  styleEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  kit_typeEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  object_typeEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  typeEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  locationEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  colorEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  combinedEmbedding: virtual(async (value, obj) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value)
      } catch {
        return null
      }
    }
    return value
  }),
  createdAt: virtual(async (staticResourceVector) => fromDateTimeSql(staticResourceVector.createdAt)),
  updatedAt: virtual(async (staticResourceVector) => fromDateTimeSql(staticResourceVector.updatedAt))
})

export const staticResourceVectorExternalResolver = resolve<StaticResourceVectorType, HookContext<Application>>({
  // Hide embeddings from external responses by default for performance
  captionEmbedding: async () => undefined,
  descriptionEmbedding: async () => undefined,
  tagsEmbedding: async () => undefined,
  materialEmbedding: async () => undefined,
  styleEmbedding: async () => undefined,
  kit_typeEmbedding: async () => undefined,
  object_typeEmbedding: async () => undefined,
  typeEmbedding: async () => undefined,
  locationEmbedding: async () => undefined,
  colorEmbedding: async () => undefined,
  combinedEmbedding: async () => undefined
})

export const staticResourceVectorDataResolver = resolve<StaticResourceVectorData, HookContext<Application>>({
  id: async () => {
    return uuidv4()
  },
  createdAt: getDateTimeSql,
  updatedAt: getDateTimeSql,
  // Convert embedding arrays to vector format for database storage
  captionEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  descriptionEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  tagsEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  materialEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  styleEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  kit_typeEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  object_typeEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  typeEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  locationEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  colorEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  combinedEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  }
})

export const staticResourceVectorPatchResolver = resolve<StaticResourceVectorPatch, HookContext<Application>>({
  // Convert embedding arrays to vector format for database storage
  captionEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  descriptionEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  tagsEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  materialEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  styleEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  kit_typeEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  object_typeEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  typeEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  locationEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  colorEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  },
  combinedEmbedding: async (value) => {
    if (Array.isArray(value)) {
      return `[${value.join(',')}]`
    }
    return value
  }
})

export const staticResourceVectorQueryResolver = resolve<StaticResourceVectorQuery, HookContext<Application>>({})
