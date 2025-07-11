# Static Resource Vector Database

This module provides vector database functionality for static resources in IR Engine, enabling semantic search capabilities across media assets.

## Overview

The vector database system creates a complementary table to the main static resources database that contains semantically searchable fields and vector embeddings. This allows for advanced search capabilities using natural language queries.

## Features

- **Semantic Search**: Search static resources using natural language queries
- **Multiple Search Fields**: Search across caption, tags, material, style, type, object_type, location, and color fields
- **Vector Embeddings**: Stores high-dimensional vector representations for similarity search
- **Automatic Sync**: Automatically keeps vector database in sync with static resource changes
- **Batch Operations**: Supports batch synchronization for performance

## Database Schema

The vector database table includes:

- `id`: Primary key (UUID)
- `staticResourceId`: Foreign key to static resource (UUID)
- `caption`: Searchable long text description
- `tags`: Array of searchable tags
- `material`: Material type (e.g., "wood", "metal", "fabric")
- `style`: Style description (e.g., "modern", "rustic", "minimalist")
- `object_type`: Object type (e.g., "armchair", "seating", "furniture")
- `location`: Expected locations information (e.g., "living room", "lounge", "modern office")
- `color`: Color scheme information (e.g., "red", "blue", "multicolor")
- Vector embeddings for each field (1024-dimensional vectors)
- Timestamps for creation and updates

## Usage

### Basic CRUD Operations

```typescript
// Get the vector service
const vectorService = app.service('static-resource-vector')

// Create a vector entry
const vectorEntry = await vectorService.create({
  staticResourceId: 'resource-uuid',
  caption: 'A large, cube-shaped armchair upholstered in light brown boucle fabric.',
  tags: 'armchair, modern, upholstered',
  material: 'fabric',
  style: 'modern, contemporary',
  object_type: 'armchair, furniture',
  location: 'living room, lounge',
  color: 'light brown, tan'
})

// Find vector entries
const results = await vectorService.find({
  query: { type: 'asset' }
})

// Update a vector entry
await vectorService.patch(vectorEntry.id, {
  description: 'Updated description'
})

// Remove a vector entry
await vectorService.remove(vectorEntry.id)
```

### Semantic Search

```typescript
// Direct semantic search
const results = await vectorService.semanticSearch(
  'wooden furniture',  // query
  'material',         // field to search (optional, defaults to 'combined')
  0.7,               // similarity threshold (optional, defaults to 0.7)
  10                 // max results (optional, defaults to 10)
)

// Semantic search through find method
const results = await vectorService.find({
  query: {
    semanticSearch: 'red sports car',
    searchField: 'combined',
    similarityThreshold: 0.8,
    maxResults: 5
  }
})
```

### Sync Operations

```typescript
// Sync a single static resource
await vectorService.syncStaticResource(staticResource)

// Batch sync multiple resources
await vectorService.batchSyncStaticResources(staticResources)

// Delete vector entry by static resource ID
await vectorService.deleteByStaticResourceId('resource-uuid')

// Update reference when resource is moved/renamed
await vectorService.updateStaticResourceReference(
  'old-resource-uuid',
  'new-resource-uuid'
)
```

## Automatic Synchronization

The system automatically synchronizes with the static resource database through hooks:

- **Create/Update**: When a static resource is created or updated, a corresponding vector entry is created or updated
- **Delete**: When a static resource is deleted, the corresponding vector entry is removed
- **Move/Rename**: When a static resource ID changes, the vector entry reference is updated

## Configuration

### Environment Variables

```bash
# PostgreSQL Vector Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=vector-db
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
POSTGRES_URL=
POSTGRES_POOL_MAX=5
```

### Docker Setup

The system uses PostgreSQL with the PGVector extension, and Ollama for text embeddings:

```yaml
postgres:
    image: pgvector/pgvector:pg16
    container_name: ir-engine_vector_db
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DATABASE: vector-db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  ollama:
    image: ollama/ollama:latest
    entrypoint:
      [
        "/bin/bash",
        "-c",
        "ollama serve & sleep 5 && ollama pull mxbai-embed-large && wait",
      ]
    environment:
      - OLLAMA_KEEP_ALIVE="24h"
    volumes:
      - ollama_storage:/root/.ollama
    ports:
      - "11434:11434"
    healthcheck:
      test: ["CMD-SHELL", "ollama list | grep -q mxbai-embed-large"] # Check if model is pulled
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s # Give Ollama time to start and pull models
    restart: unless-stopped
  
volumes:
  postgres_data:
  
  ollama_storage:
```

## Embedding Generation

Currently, the system uses Ollama embeddings. You can replace the `generateEmbedding` method in the service class with other embedding service such as OpenAI embeddings:

```typescript
// Example with OpenAI embeddings
private async generateEmbedding(text: string): Promise<number[] | undefined> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}
```

## Performance Considerations

- Vector indexes use IVFFlat for efficient similarity search
- Text search indexes are created for traditional search capabilities
- Batch operations are recommended for large datasets
- Consider adjusting similarity thresholds based on your use case

## Migration

The vector database migrations run automatically when the application starts. You can also run them manually:

```typescript
import { runVectorDbMigrations } from './vector-db-migrations'

await runVectorDbMigrations(app)
```

## Testing

Run the tests with:

```bash
npm test -- static-resource-vector.test.ts
```

## Security

- Vector search operations require 'editor' scope for read access
- Create/update/delete operations require 'admin' scope
- Internal service calls bypass these restrictions for automatic sync

## Troubleshooting

### Common Issues

1. **PGVector extension not found**: Ensure you're using the `pgvector/pgvector` Docker image
2. **Migration failures**: Check PostgreSQL connection and permissions
3. **Slow search performance**: Verify vector indexes are created and consider adjusting IVFFlat parameters
4. **Sync failures**: Check that both MySQL and PostgreSQL databases are accessible
4. **Embeddings not working**: Check that Ollama is running and the embedding model is pulled correctly

### Logs

The system logs important events:

- Vector database connection status
- Migration results
- Sync operation results
- Search performance metrics
