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

import multiLogger from '@ir-engine/common/src/logger'
import { staticResourceVectorPath } from '@ir-engine/common/src/schemas/media/static-resource-vector.schema'
import type { Knex } from 'knex'

const logger = multiLogger.child({ component: 'server-core:postgres' })

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex: Knex): Promise<void> {
  // Enable pgvector extension if not already enabled
  await knex.raw('CREATE EXTENSION IF NOT EXISTS vector')

  // Using 1024-dimensional embeddings by default (Ollama mxbai-embed-large model dimension)
  const vectorSize = process.env.PGVECTOR_VECTOR_SIZE ? parseInt(process.env.PGVECTOR_VECTOR_SIZE) : 1024

  logger.info('Creating static resource vector table with vector size:', vectorSize)

  const tableExists = await knex.schema.hasTable(staticResourceVectorPath)

  if (!tableExists) {
    await knex.schema.createTable(staticResourceVectorPath, (table) => {
      // Primary key
      table.uuid('id').primary()

      // Foreign key to static_resource table (references MySQL database)
      table.uuid('staticResourceId').notNullable()
      table.index('staticResourceId')

      // Searchable text fields
      table.string('caption', 1023).nullable()
      table.string('tags', 255).nullable()
      table.string('material', 255).nullable()
      table.string('style', 255).nullable()
      table.string('object_type', 255).nullable()
      table.string('location', 255).nullable()
      table.string('color', 255).nullable()

      // Vector embeddings (using pgvector extension)
      table.specificType('captionEmbedding', `vector(${vectorSize})`).nullable()
      table.specificType('tagsEmbedding', `vector(${vectorSize})`).nullable()
      table.specificType('materialEmbedding', `vector(${vectorSize})`).nullable()
      table.specificType('styleEmbedding', `vector(${vectorSize})`).nullable()
      table.specificType('object_typeEmbedding', `vector(${vectorSize})`).nullable()
      table.specificType('locationEmbedding', `vector(${vectorSize})`).nullable()
      table.specificType('colorEmbedding', `vector(${vectorSize})`).nullable()
      table.specificType('combinedEmbedding', `vector(${vectorSize})`).nullable()

      // Timestamps
      table.timestamp('createdAt').defaultTo(knex.fn.now()).notNullable()
      table.timestamp('updatedAt').defaultTo(knex.fn.now()).notNullable()
    })

    // Create indexes for vector similarity search using IVFFlat
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_caption_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("captionEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_tags_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("tagsEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_material_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("materialEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_style_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("styleEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_object_type_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("object_typeEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_location_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("locationEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_color_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("colorEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_combined_embedding 
      ON "${staticResourceVectorPath}" USING ivfflat ("combinedEmbedding" vector_cosine_ops) 
      WITH (lists = 100)
    `)

    // Create text search indexes for traditional search
    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_caption_text 
      ON "${staticResourceVectorPath}" USING gin(to_tsvector('english', caption))
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_tags_text 
      ON "${staticResourceVectorPath}" (tags)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_material_text 
      ON "${staticResourceVectorPath}" (material)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_style_text 
      ON "${staticResourceVectorPath}" (style)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_object_type_text 
      ON "${staticResourceVectorPath}" (object_type)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_location_text 
      ON "${staticResourceVectorPath}" (location)
    `)

    await knex.raw(`
      CREATE INDEX IF NOT EXISTS idx_static_resource_vector_color_text 
      ON "${staticResourceVectorPath}" (color)
    `)

    // Create unique constraint on staticResourceId to prevent duplicates
    await knex.raw(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_static_resource_vector_unique_resource_id 
      ON "${staticResourceVectorPath}" ("staticResourceId")
    `)
  }
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex: Knex): Promise<void> {
  const tableExists = await knex.schema.hasTable(staticResourceVectorPath)

  if (tableExists) {
    await knex.schema.dropTable(staticResourceVectorPath)
  }
}
