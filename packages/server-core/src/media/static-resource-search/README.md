# Static Resource Search Service

This service provides a client-facing API for performing semantic search on static resources using the vector database. It exposes only the `find` method and returns search results with relevance scores.

## Overview

The Static Resource Search service acts as a bridge between clients and the vector database, providing:

- **Semantic Search**: Natural language queries across static resources
- **Field-Specific Search**: Target specific fields like caption, tags, material, style, object_type, location, or color
- **Relevance Scoring**: Results sorted by similarity to the search query
- **Filtering**: Additional filters by project, type, or mime type
- **Pagination**: Standard pagination support with limit and skip

## API Reference

### Find Method

**Endpoint**: `GET /static-resource-search`

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `semanticSearch` | string | Yes | - | Search query (1-500 characters) |
| `searchField` | string | No | `combined` | Field to search in: `caption`, `tags`, `material`, `style`, `object_type`, `location`, `color`, `combined` |
| `similarityThreshold` | number | No | `0.7` | Minimum similarity score (0-1) |
| `$limit` | number | No | `20` | Maximum results to return (1-100) |
| `$skip` | number | No | `0` | Number of results to skip |
| `project` | string | No | - | Filter by project name |
| `type` | string | No | - | Filter by resource type |
| `mimeType` | string | No | - | Filter by MIME type |

**Response Format**:

```typescript
{
  total: number,      // Total number of matching results
  limit: number,      // Limit applied to this request
  skip: number,       // Skip applied to this request
  data: [             // Array of search results
    {
      // Static resource fields
      id: string,
      key: string,
      name: string,
      description?: string,
      type: string,
      mimeType?: string,
      project?: string,
      hash: string,
      url: string,
      thumbnailKey?: string,
      thumbnailURL?: string,
      createdAt: string,
      updatedAt: string,
      
      // Search metadata
      searchScore: number,        // Similarity score (0-1)
      matchedField: string,       // Field that matched the query
      matchedContent?: string     // Content that was matched
    }
  ]
}
```

## Usage Examples

### Basic Search

```typescript
// Search for "red car" across all fields
const results = await app.service('static-resource-search').find({
  query: {
    query: 'red car'
  }
})
```

### Field-Specific Search

```typescript
// Search only in material field
const results = await app.service('static-resource-search').find({
  query: {
    semanticSearch: 'wood',
    searchField: 'material'
  }
})
```

### Advanced Search with Filters

```typescript
// Search for models in a specific project with high similarity
const results = await app.service('static-resource-search').find({
  query: {
    semanticSearch: 'futuristic spaceship',
    searchField: 'caption',
    similarityThreshold: 0.8,
    type: 'asset',
    project: 'sci-fi-assets',
    $limit: 10
  }
})
```

### Pagination

```typescript
// Get second page of results
const results = await app.service('static-resource-search').find({
  query: {
    query: 'furniture',
    $limit: 20,
    $skip: 20
  }
})
```

## Client Usage

### JavaScript/TypeScript

```typescript
import { feathers } from '@feathersjs/feathers'

const app = feathers()
// ... configure app

// Perform search
const searchResults = await app.service('static-resource-search').find({
  query: {
    semanticSearch: 'wooden chair',
    searchField: 'combined',
    $limit: 10
  }
})

console.log(`Found ${searchResults.total} results`)
searchResults.data.forEach(result => {
  console.log(`${result.name} (score: ${result.searchScore})`)
})
```

### REST API

Replace <JWT_TOKEN> with your JWT token, which you can get from browser console by running following command:
localStorage.getItem('ir.hyperflux.AuthState.authUser')

```bash
# Basic search
curl -k "https://localhost:3030/static-resource-search?semanticSearch=red%20car" -H "Authorization: Bearer <JWT_TOKEN>"

# Advanced search
curl -k "https://localhost:3030/static-resource-search?semanticSearch=wooden%20furniture&searchField=material&similarityThreshold=0.8&type=model&\$limit=5" -H "Authorization: Bearer <JWT_TOKEN>"
```

## Search Fields

| Field | Description | Example Content |
|-------|-------------|-----------------|
| `caption` | Resource long description | "A beautiful red sports car" |
| `tags` | Resource tags | "car" |
| `material` | Material properties | "wood", "metal", "fabric" |
| `style` | Style or aesthetic | "modern", "rustic", "minimalist" |
| `object_type` | Resource object type | "vehicle" |
| `location` | Color information | "red", "blue", "multicolor" |
| `color` | Color information | "red", "blue", "multicolor" |
| `combined` | All fields combined | Searches across all available text |

## Performance Considerations

- **Similarity Threshold**: Higher thresholds (0.8-0.9) return fewer but more relevant results
- **Field-Specific Search**: Searching specific fields is faster than combined search
- **Pagination**: Use reasonable page sizes (10-50 items) for best performance
- **Caching**: Results are not cached by default; consider client-side caching for repeated queries

## Security

- **Authentication**: Requires user authentication with 'user' scope
- **Rate Limiting**: Basic rate limiting is applied to prevent abuse
- **Input Validation**: Query length and content are validated
- **Scope Verification**: Only users with read permissions can search

## Error Handling

Common error responses:

```typescript
// Missing query
{
  "name": "BadRequest",
  "message": "Search query is required",
  "code": 400
}

// Query too short
{
  "name": "BadRequest", 
  "message": "Search query must be at least 2 characters long",
  "code": 400
}

// Query too long
{
  "name": "BadRequest",
  "message": "Search query too long (max 500 characters)",
  "code": 400
}

// Unsupported method
{
  "name": "NotImplemented",
  "message": "Get method is not supported for search service",
  "code": 501
}
```

## Analytics

The service automatically logs search analytics including:

- Search queries and parameters
- Result counts
- User information (if available)
- Timestamps

This data can be used to improve search relevance and understand user behavior.

## Testing

Run the search service tests:

```bash
npm test -- static-resource-search.test.ts
```

## Integration with Vector Database

The search service integrates with the static-resource-vector service to:

1. Perform semantic search using vector embeddings
2. Retrieve matching static resource IDs
3. Fetch full static resource data
4. Combine results with search metadata
5. Apply additional filters and pagination

## Limitations

- **Read-Only**: Only supports the `find` method
- **Vector Dependency**: Requires the vector database to be available
- **Ollama Embeddings**: Currently uses Ollama embeddings for development
- **Rate Limiting**: Basic rate limiting implementation

## Future Enhancements

- **Real Embeddings**: Integration with other embedding services such as OpenAI
- **Advanced Filtering**: More sophisticated filtering options
- **Search Suggestions**: Auto-complete and search suggestions
- **Result Caching**: Intelligent caching of search results
- **Analytics Dashboard**: Visual analytics for search patterns
