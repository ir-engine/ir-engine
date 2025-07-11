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

import { BadRequest, NotImplemented } from '@feathersjs/errors'
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import {
  DEFAULT_SEARCH_PARAMS,
  StaticResourceSearchQueryType,
  StaticResourceSearchResponseType,
  StaticResourceSearchResultType
} from '@ir-engine/common/src/schemas/media/static-resource-search.schema'
import { staticResourceVectorPath } from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { staticResourcePath } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import { Application } from '../../../declarations'
import { getStorageProvider } from '../storageprovider/storageprovider'

export interface StaticResourceSearchParams extends Params {
  query?: StaticResourceSearchQueryType
}

export class StaticResourceSearchService implements Partial<ServiceMethods<StaticResourceSearchResponseType>> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Find static resources using semantic search
   */
  async find(params?: StaticResourceSearchParams): Promise<StaticResourceSearchResponseType> {
    if (!params?.query?.semanticSearch) {
      throw new BadRequest('Search query is required')
    }

    const {
      semanticSearch: searchQuery,
      searchField = DEFAULT_SEARCH_PARAMS.searchField,
      similarityThreshold = DEFAULT_SEARCH_PARAMS.similarityThreshold,
      $limit = DEFAULT_SEARCH_PARAMS.limit,
      $skip = 0,
      project,
      type,
      mimeType
    } = params.query

    try {
      // Get the vector service
      const vectorService = this.app.service(staticResourceVectorPath) as any
      if (!vectorService) {
        throw new BadRequest('Vector search service not available')
      }

      // Perform semantic search on vector database
      const vectorResults = await vectorService.semanticSearch(
        searchQuery,
        searchField,
        similarityThreshold,
        $limit + $skip // Get more results to account for filtering
      )

      if (!vectorResults || vectorResults.length === 0) {
        return {
          total: 0,
          limit: $limit,
          skip: $skip,
          data: []
        }
      }

      // Extract static resource IDs from vector results
      const staticResourceIds = vectorResults.map((result: any) => result.staticResourceId)

      // Build query for static resources
      const staticResourceQuery: any = {
        id: { $in: staticResourceIds },
        $limit: staticResourceIds.length,
        $select: [
          'id',
          'key',
          'name',
          'description',
          'type',
          'mimeType',
          'project',
          'hash',
          'thumbnailKey',
          'createdAt',
          'updatedAt'
        ]
      }

      // Apply additional filters
      if (project) staticResourceQuery.project = project
      if (type) staticResourceQuery.type = type
      if (mimeType) staticResourceQuery.mimeType = mimeType

      // Get static resources
      const staticResourceService = this.app.service(staticResourcePath) as any
      const staticResourceResults = await staticResourceService.find({
        query: staticResourceQuery,
        paginate: false,
        isInternal: true
      })

      const staticResources = Array.isArray(staticResourceResults)
        ? staticResourceResults
        : staticResourceResults.data || []

      // Create a map for quick lookup
      const staticResourceMap = new Map()
      staticResources.forEach((resource: any) => {
        staticResourceMap.set(resource.id, resource)
      })

      // Combine vector results with static resource data
      const storageProvider = getStorageProvider()
      const combinedResults: StaticResourceSearchResultType[] = []

      for (const vectorResult of vectorResults) {
        const staticResource = staticResourceMap.get(vectorResult.staticResourceId)
        if (!staticResource) continue

        // Generate URLs
        const url = storageProvider.getCachedURL(staticResource.key, params?.isInternal)
        const thumbnailURL = staticResource.thumbnailKey
          ? storageProvider.getCachedURL(staticResource.thumbnailKey, params?.isInternal)
          : undefined

        // Determine which field matched and extract content
        const matchedField = this.getMatchedField(vectorResult, searchField)
        const matchedContent = this.getMatchedContent(vectorResult, matchedField)

        combinedResults.push({
          // Static resource data
          id: staticResource.id,
          key: staticResource.key,
          name: staticResource.name,
          description: staticResource.description,
          type: staticResource.type,
          mimeType: staticResource.mimeType,
          project: staticResource.project,
          hash: staticResource.hash,
          url,
          thumbnailKey: staticResource.thumbnailKey,
          thumbnailURL,
          createdAt: staticResource.createdAt,
          updatedAt: staticResource.updatedAt,

          // Search metadata
          searchScore: (vectorResult as any).similarity || 0,
          matchedField,
          matchedContent
        })
      }

      // Apply pagination
      const total = combinedResults.length
      const paginatedResults = combinedResults.slice($skip, $skip + $limit)

      return {
        total,
        limit: $limit,
        skip: $skip,
        data: paginatedResults
      }
    } catch (error) {
      console.error('Error in semantic search:', error)
      throw new BadRequest(`Search failed: ${error.message}`)
    }
  }

  /**
   * Determine which field was matched in the search
   */
  private getMatchedField(vectorResult: any, searchField: string): string {
    if (searchField !== 'combined') {
      return searchField
    }

    // For combined search, try to determine the best matching field
    // This is a simplified approach - in production you might want more sophisticated logic
    const fields = ['caption', 'material', 'style', 'type', 'color']

    for (const field of fields) {
      if (vectorResult[field] && vectorResult[field].trim()) {
        return field
      }
    }

    return 'combined'
  }

  /**
   * Extract the content that was matched
   */
  private getMatchedContent(vectorResult: any, matchedField: string): string | undefined {
    if (matchedField === 'combined') {
      // Return a combination of available fields
      const fields = ['caption', 'material', 'style', 'type', 'color']
      const content = fields
        .map((field) => vectorResult[field])
        .filter(Boolean)
        .join(' ')
      return content || undefined
    }

    return vectorResult[matchedField] || undefined
  }

  // Throw NotImplemented for unsupported methods
  async get(id: Id, params?: Params): Promise<StaticResourceSearchResponseType> {
    throw new NotImplemented('Get method is not supported for search service')
  }

  async create(data: any, params?: Params): Promise<StaticResourceSearchResponseType> {
    throw new NotImplemented('Create method is not supported for search service')
  }

  async update(id: NullableId, data: any, params?: Params): Promise<StaticResourceSearchResponseType> {
    throw new NotImplemented('Update method is not supported for search service')
  }

  async patch(id: NullableId, data: any, params?: Params): Promise<StaticResourceSearchResponseType> {
    throw new NotImplemented('Patch method is not supported for search service')
  }

  async remove(id: NullableId, params?: Params): Promise<StaticResourceSearchResponseType> {
    throw new NotImplemented('Remove method is not supported for search service')
  }
}
