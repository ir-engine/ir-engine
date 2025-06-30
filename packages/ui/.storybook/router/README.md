# Custom React Router for Storybook

This directory contains a custom React Router implementation specifically designed for Storybook stories. It provides flexible routing capabilities that can be configured per story or globally.

## Features

- **Flexible Configuration**: Configure routes per story or use global defaults
- **Memory Router**: Uses React Router's MemoryRouter for isolated routing in Storybook
- **Context API**: Provides router context for accessing navigation state
- **Utility Functions**: Helper functions for common routing scenarios
- **TypeScript Support**: Full TypeScript support with proper type definitions

## Components

### CustomStorybookRouter
The main router component that provides enhanced routing capabilities with context.

```tsx
import { CustomStorybookRouter } from './router/CustomStorybookRouter'

<CustomStorybookRouter config={{ initialEntries: ['/'], routes: [] }}>
  <YourComponent />
</CustomStorybookRouter>
```

### SimpleStorybookRouter
A simplified router for basic routing needs.

```tsx
import { SimpleStorybookRouter } from './router/CustomStorybookRouter'

<SimpleStorybookRouter initialEntries={['/home']}>
  <YourComponent />
</SimpleStorybookRouter>
```

### RouterDecorator
A Storybook decorator that automatically wraps stories with routing functionality.

## Usage

### 1. Basic Story with Routing

```tsx
import { Meta, StoryObj } from '@storybook/react'
import { createRouterParameters } from '../.storybook/router/RouterUtils'

const meta: Meta<typeof YourComponent> = {
  title: 'Components/YourComponent',
  component: YourComponent,
}

export const Default: StoryObj = {
  parameters: createRouterParameters({
    initialEntries: ['/'],
    routes: [
      { path: '/', element: <div>Home</div> },
      { path: '/about', element: <div>About</div> }
    ]
  })
}
```

### 2. Using Navigation in Components

```tsx
import { useNavigate, useLocation } from 'react-router-dom'

const YourComponent = () => {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div>
      <p>Current path: {location.pathname}</p>
      <button onClick={() => navigate('/about')}>
        Go to About
      </button>
    </div>
  )
}
```

### 3. Using Router Context

```tsx
import { useStorybookRouter } from '../.storybook/router/CustomStorybookRouter'

const YourComponent = () => {
  const { currentPath, navigate, routes } = useStorybookRouter()

  return (
    <div>
      <p>Current: {currentPath}</p>
      <button onClick={() => navigate('/admin')}>
        Go to Admin
      </button>
    </div>
  )
}
```

### 4. Common Route Configurations

```tsx
import { commonRoutes, mergeRoutes } from '../.storybook/router/RouterUtils'

// Use predefined route sets
export const AdminStory: StoryObj = {
  parameters: createRouterParameters({
    routes: commonRoutes.admin
  })
}

// Merge multiple route sets
export const CombinedStory: StoryObj = {
  parameters: createRouterParameters({
    routes: mergeRoutes(commonRoutes.basic, commonRoutes.admin)
  })
}
```

## Configuration Options

### RouterConfig Interface

```tsx
interface RouterConfig {
  initialEntries?: string[]     // Initial route entries
  initialIndex?: number         // Starting route index
  routes?: RouteConfig[]        // Custom routes
  history?: MemoryHistory       // Custom history instance
}
```

### RouteConfig Interface

```tsx
interface RouteConfig {
  path: string                  // Route path
  element: React.ReactElement   // Component to render
}
```

## Predefined Route Sets

The router utilities include several predefined route configurations:

- `commonRoutes.basic`: Basic routes (/, /about, /contact)
- `commonRoutes.admin`: Admin routes (/admin, /admin/users, /admin/settings)
- `commonRoutes.location`: Location routes (/location, /location/:id)

## Router Decorators

The router system includes several predefined decorators for common use cases:

### Available Decorators

1. **RouterDecorator** (Default): Automatically applied to all stories
2. **SimpleRouterDecorator**: Basic routing without custom configuration
3. **AdminRouterDecorator**: Preconfigured with admin routes
4. **LocationRouterDecorator**: Preconfigured with location routes
5. **BasicRouterDecorator**: Preconfigured with basic navigation routes

### Using Decorators

```tsx
// Use a predefined decorator
export const MyStory: StoryObj = {
  render: () => <MyComponent />,
  decorators: [AdminRouterDecorator]
}

// Create a custom decorator
const CustomDecorator = createRouterDecorator({
  initialEntries: ['/dashboard'],
  routes: [
    { path: '/dashboard', element: <div>Dashboard</div> }
  ]
})

export const CustomStory: StoryObj = {
  render: () => <MyComponent />,
  decorators: [CustomDecorator]
}
```

## Best Practices

1. **Use RouterDecorator**: The RouterDecorator is automatically applied to all stories, providing basic routing functionality.

2. **Choose the Right Decorator**: Use predefined decorators for common scenarios, create custom ones for specific needs.

3. **Configure per Story**: Use `createRouterParameters()` to configure routing for specific stories that need custom routes.

4. **Test Navigation**: Include navigation testing in your stories to ensure routing works correctly.

5. **Use TypeScript**: Take advantage of the TypeScript definitions for better development experience.

6. **Memory Router**: Remember that this uses MemoryRouter, so routes don't affect the browser URL.

## Examples

See `RouterExample.stories.tsx` and `RouterDecorator.stories.tsx` for comprehensive examples of how to use the custom router and decorators in different scenarios.
