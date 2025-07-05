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

import { Params } from '@feathersjs/feathers'
import { KnexAdapterOptions, KnexAdapterParams, KnexService } from '@feathersjs/knex'
import {
  StaticResourceVectorData,
  StaticResourceVectorPatch,
  StaticResourceVectorQuery,
  StaticResourceVectorType
} from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import { Application } from '../../../declarations'

import { Ollama } from 'ollama'

// Ollama API endpoint
const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'

// Ollama embedding model name （such as 'mxbai-embed-large', etc.）
const EMBEDDING_MODEL_NAME = 'mxbai-embed-large'

export interface StaticResourceVectorParams extends KnexAdapterParams<StaticResourceVectorQuery> {}

export class StaticResourceVectorService<
  T = StaticResourceVectorType,
  ServiceParams extends Params = StaticResourceVectorParams
> extends KnexService<
  StaticResourceVectorType,
  StaticResourceVectorData,
  StaticResourceVectorParams,
  StaticResourceVectorPatch
> {
  app: Application
  textEmbeddingModel: Ollama

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app

    this.textEmbeddingModel = new Ollama({ host: OLLAMA_API_URL })
  }

  /**
   * Perform semantic search using vector similarity
   */
  async semanticSearch(
    query: string,
    field:
      | 'caption'
      | 'description'
      | 'tags'
      | 'material'
      | 'style'
      | 'kit_type'
      | 'object_type'
      | 'type'
      | 'location'
      | 'color'
      | 'combined' = 'combined',
    threshold: number = 0.7,
    limit: number = 10
  ): Promise<StaticResourceVectorType[]> {
    // Generate embedding for the query
    const queryEmbedding = await this.generateEmbedding(query)

    if (!queryEmbedding) {
      return []
    }

    const embeddingField = `${field}Embedding`

    // Convert query embedding to PostgreSQL vector format
    const queryVector = `[${queryEmbedding.join(',')}]`

    // Perform vector similarity search using cosine distance
    const results = await this.Model.raw(
      `
      SELECT *,
             1 - ("${embeddingField}" <=> ?) as similarity
      FROM "static-resource-vector"
      WHERE "${embeddingField}" IS NOT NULL
        AND 1 - ("${embeddingField}" <=> ?) >= ?
      ORDER BY "${embeddingField}" <=> ?
      LIMIT ?
    `,
      [queryVector, queryVector, threshold, queryVector, limit]
    )

    return results.rows || []
  }

  /**
   * Generate embedding for text using Ollama embedding service
   */
  private async generateEmbedding(text: string): Promise<number[] | undefined> {
    try {
      const response = await this.textEmbeddingModel.embed({
        model: EMBEDDING_MODEL_NAME,
        input: text
      })

      // const embedding = `[${response.embeddings.join(',')}]`
      const embedding = response.embeddings

      console.log('Generated Embeddings:', embedding[0].slice(0, 12))

      // returns embedding of first chunk only (1024 tokens)
      return embedding[0]
    } catch (error) {
      console.error('Error generating text embedding:', error)
      return undefined
    }
  }

  /**
   * Create or update vector entry for a static resource
   */
  async upsertVectorEntry(data: {
    staticResourceId: string
    caption?: string
    description?: string
    tags?: string
    material?: string
    style?: string
    kit_type?: string
    object_type?: string
    type?: string
    location?: string
    color?: string
  }): Promise<StaticResourceVectorType> {
    // Check if entry already exists
    const existing = (await this.find({
      query: { staticResourceId: data.staticResourceId },
      paginate: false
    })) as StaticResourceVectorType[]

    // Generate embeddings for each field
    const embeddings: any = {}

    if (data.caption) {
      embeddings.captionEmbedding = await this.generateEmbedding(data.caption)
    }
    if (data.description) {
      embeddings.descriptionEmbedding = await this.generateEmbedding(data.description)
    }
    if (data.tags) {
      embeddings.tagsEmbedding = await this.generateEmbedding(data.tags)
    }
    if (data.material) {
      embeddings.materialEmbedding = await this.generateEmbedding(data.material)
    }
    if (data.style) {
      embeddings.styleEmbedding = await this.generateEmbedding(data.style)
    }
    if (data.kit_type) {
      embeddings.kit_typeEmbedding = await this.generateEmbedding(data.kit_type)
    }
    if (data.object_type) {
      embeddings.object_typeEmbedding = await this.generateEmbedding(data.object_type)
    }
    if (data.type) {
      embeddings.typeEmbedding = await this.generateEmbedding(data.type)
    }
    if (data.location) {
      embeddings.locationEmbedding = await this.generateEmbedding(data.location)
    }
    if (data.color) {
      embeddings.colorEmbedding = await this.generateEmbedding(data.color)
    }

    // Generate combined embedding from all text fields
    const combinedText = [
      data.caption,
      data.description,
      data.tags,
      data.material,
      data.style,
      data.kit_type,
      data.object_type,
      data.type,
      data.location,
      data.color
    ]
      .filter(Boolean)
      .join(' ')

    if (combinedText) {
      embeddings.combinedEmbedding = await this.generateEmbedding(combinedText)
    }

    const vectorData = {
      ...data,
      ...embeddings
    }

    if (existing.length > 0) {
      // Update existing entry
      return await this.patch(existing[0].id, vectorData)
    } else {
      // Create new entry
      return await this.create(vectorData)
    }
  }

  /**
   * Delete vector entry by static resource ID
   */
  async deleteByStaticResourceId(staticResourceId: string): Promise<void> {
    const existing = (await this.find({
      query: { staticResourceId },
      paginate: false
    })) as StaticResourceVectorType[]

    for (const entry of existing) {
      await this.remove(entry.id)
    }
  }

  /**
   * Update vector entry when static resource is moved/renamed
   */
  async updateStaticResourceReference(oldStaticResourceId: string, newStaticResourceId: string): Promise<void> {
    const existing = (await this.find({
      query: { staticResourceId: oldStaticResourceId },
      paginate: false
    })) as StaticResourceVectorType[]

    for (const entry of existing) {
      await this.patch(entry.id, { staticResourceId: newStaticResourceId })
    }
  }

  /**
   * Override find method to handle semantic search queries
   */
  async find(params?: StaticResourceVectorParams): Promise<any> {
    if (params?.query?.semanticSearch) {
      const {
        semanticSearch,
        searchField = 'combined',
        similarityThreshold = 0.7,
        maxResults = 10,
        ...otherQuery
      } = params.query

      // Perform semantic search
      const results = await this.semanticSearch(semanticSearch, searchField as any, similarityThreshold, maxResults)

      // If there are other query parameters, filter the results
      if (Object.keys(otherQuery).length > 0) {
        // Apply additional filters using the base find method
        const filteredParams = { ...params, query: otherQuery }
        const baseResults = await super.find(filteredParams)
        const baseResultsArray = Array.isArray(baseResults) ? baseResults : baseResults.data || []

        // Intersect semantic search results with filtered results
        const filteredIds = new Set(baseResultsArray.map((r: any) => r.id))
        return results.filter((r) => filteredIds.has(r.id))
      }

      return results
    }

    return super.find(params)
  }

  /**
   * Sync static resource data to vector database
   */
  async syncStaticResource(staticResource: any): Promise<void> {
    try {
      // Extract searchable fields from static resource
      const vectorData = {
        staticResourceId: staticResource.id,
        caption: staticResource.description || staticResource.name || '',
        material: this.extractMaterial(staticResource),
        style: this.extractStyle(staticResource),
        type: staticResource.type || staticResource.mimeType || '',
        color: this.extractColor(staticResource)
      }

      await this.upsertVectorEntry(vectorData)
    } catch (error) {
      console.error(`Failed to sync static resource ${staticResource.id} to vector database:`, error)
    }
  }

  /**
   * Extract material information from static resource
   */
  private extractMaterial(staticResource: any): string {
    // Try to extract material from tags, metadata, or other fields
    if (staticResource.tags && Array.isArray(staticResource.tags)) {
      const materialTags = staticResource.tags.filter(
        (tag: string) =>
          tag.toLowerCase().includes('material') ||
          tag.toLowerCase().includes('texture') ||
          tag.toLowerCase().includes('surface')
      )
      if (materialTags.length > 0) return materialTags.join(' ')
    }

    if (staticResource.stats?.material) return staticResource.stats.material
    return ''
  }

  /**
   * Extract style information from static resource
   */
  private extractStyle(staticResource: any): string {
    // Try to extract style from tags, metadata, or other fields
    if (staticResource.tags && Array.isArray(staticResource.tags)) {
      const styleTags = staticResource.tags.filter(
        (tag: string) =>
          tag.toLowerCase().includes('style') ||
          tag.toLowerCase().includes('theme') ||
          tag.toLowerCase().includes('aesthetic')
      )
      if (styleTags.length > 0) return styleTags.join(' ')
    }

    if (staticResource.stats?.style) return staticResource.stats.style
    return ''
  }

  /**
   * Extract color information from static resource
   */
  private extractColor(staticResource: any): string {
    // Try to extract color from tags, metadata, or other fields
    if (staticResource.tags && Array.isArray(staticResource.tags)) {
      const colorTags = staticResource.tags.filter((tag: string) =>
        /\b(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|brown|cyan|magenta)\b/i.test(tag)
      )
      if (colorTags.length > 0) return colorTags.join(' ')
    }

    if (staticResource.stats?.color) return staticResource.stats.color
    return ''
  }

  /**
   * Batch sync multiple static resources
   */
  async batchSyncStaticResources(staticResources: any[]): Promise<void> {
    const batchSize = 10
    for (let i = 0; i < staticResources.length; i += batchSize) {
      const batch = staticResources.slice(i, i + batchSize)
      await Promise.all(batch.map((resource) => this.syncStaticResource(resource)))
    }
  }
}
