# Custom React Router for Storybook - Complete Guide

This guide provides a comprehensive overview of the custom React Router implementation for Storybook in the IR Engine project.

## Overview

The custom router system provides flexible routing capabilities for Storybook stories, allowing you to test components that depend on React Router functionality. It includes:

- **Custom Router Components**: Enhanced router components with context support
- **Router Decorators**: Predefined decorators for common routing scenarios
- **Utility Functions**: Helper functions for configuration and navigation
- **TypeScript Support**: Full type safety and IntelliSense support

## Architecture

```
.storybook/
├── router/
│   ├── CustomStorybookRouter.tsx    # Main router components
│   ├── RouterUtils.tsx              # Utility functions and types
│   ├── RouterExample.stories.tsx    # Usage examples
│   ├── README.md                    # Detailed documentation
│   └── index.ts                     # Exports
├── decorators/
│   ├── RouterDecorator.tsx          # Router decorators
│   └── RouterDecorator.stories.tsx  # Decorator examples
└── preview.tsx                      # Global configuration
```

## Quick Start

### 1. Basic Usage (Automatic)

All stories automatically get basic routing functionality through the `RouterDecorator`:

```tsx
// Your component automatically has access to React Router hooks
const MyComponent = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  return (
    <div>
      <p>Current: {location.pathname}</p>
      <button onClick={() => navigate('/about')}>Go to About</button>
    </div>
  )
}
```

### 2. Using Predefined Decorators

```tsx
import { AdminRouterDecorator } from '../.storybook/router'

export const AdminStory: StoryObj = {
  render: () => <AdminComponent />,
  decorators: [AdminRouterDecorator]
}
```

### 3. Custom Router Configuration

```tsx
import { createRouterParameters } from '../.storybook/router'

export const CustomStory: StoryObj = {
  render: () => <MyComponent />,
  parameters: createRouterParameters({
    initialEntries: ['/dashboard'],
    routes: [
      { path: '/dashboard', element: <div>Dashboard</div> },
      { path: '/profile', element: <div>Profile</div> }
    ]
  })
}
```

## Available Decorators

| Decorator | Purpose | Initial Route | Predefined Routes |
|-----------|---------|---------------|-------------------|
| `RouterDecorator` | Default (auto-applied) | `/` | None |
| `SimpleRouterDecorator` | Basic routing | `/` | None |
| `BasicRouterDecorator` | Basic navigation | `/` | Home, About, Contact |
| `AdminRouterDecorator` | Admin interface | `/admin` | Admin, Users, Settings |
| `LocationRouterDecorator` | Location-based | `/location` | Location, Location Details |

## Creating Custom Decorators

```tsx
import { createRouterDecorator } from '../.storybook/router'

const MyCustomDecorator = createRouterDecorator({
  initialEntries: ['/my-route'],
  routes: [
    { path: '/my-route', element: <div>My Custom Route</div> },
    { path: '/another', element: <div>Another Route</div> }
  ]
})

export const MyStory: StoryObj = {
  render: () => <MyComponent />,
  decorators: [MyCustomDecorator]
}
```

## Router Context

Access router state and utilities through the context:

```tsx
import { useStorybookRouter } from '../.storybook/router'

const MyComponent = () => {
  const { currentPath, navigate, routes, history } = useStorybookRouter()
  
  return (
    <div>
      <p>Current: {currentPath}</p>
      <p>Available routes: {routes.length}</p>
      <button onClick={() => navigate('/admin')}>Go to Admin</button>
    </div>
  )
}
```

## Common Patterns

### Testing Navigation

```tsx
export const NavigationTest: StoryObj = {
  render: () => {
    const navigate = useNavigate()
    const location = useLocation()
    
    return (
      <div>
        <p>Current: {location.pathname}</p>
        <button onClick={() => navigate('/test')}>Navigate</button>
      </div>
    )
  },
  parameters: createRouterParameters({
    routes: [
      { path: '/test', element: <div>Test Route</div> }
    ]
  })
}
```

### Route Parameters

```tsx
export const RouteParams: StoryObj = {
  render: () => {
    const { id } = useParams()
    return <div>ID: {id}</div>
  },
  parameters: createRouterParameters({
    initialEntries: ['/user/123'],
    routes: [
      { path: '/user/:id', element: <div>User Details</div> }
    ]
  })
}
```

### Multiple Routes

```tsx
export const MultipleRoutes: StoryObj = {
  render: () => <MyComponent />,
  parameters: createRouterParameters({
    routes: mergeRoutes(
      commonRoutes,
      [
        { path: '/custom', element: <div>Custom</div> }
      ]
    )
  })
}
```

## Best Practices

1. **Use the Default Decorator**: Most stories work fine with the automatic RouterDecorator
2. **Choose Appropriate Decorators**: Use predefined decorators for common scenarios
3. **Test Navigation**: Include navigation testing in your stories
4. **Use TypeScript**: Take advantage of full type support
5. **Memory Router**: Remember routes don't affect browser URL
6. **Context Access**: Use `useStorybookRouter()` for advanced router state access

## Troubleshooting

### Router Context Not Available
```tsx
// ❌ Wrong - component not wrapped with router
const MyComponent = () => {
  const router = useStorybookRouter() // Error!
}

// ✅ Correct - use decorator or parameters
export const MyStory: StoryObj = {
  render: () => <MyComponent />,
  decorators: [RouterDecorator]
}
```

### Routes Not Working
```tsx
// ❌ Wrong - missing route configuration
export const MyStory: StoryObj = {
  render: () => <ComponentThatNavigatesTo('/admin') />
  // No admin route defined
}

// ✅ Correct - define required routes
export const MyStory: StoryObj = {
  render: () => <ComponentThatNavigatesTo('/admin') />,
  decorators: [AdminRouterDecorator]
}
```

## Examples

See the following files for comprehensive examples:
- `packages/ui/.storybook/router/RouterExample.stories.tsx`
- `packages/ui/.storybook/decorators/RouterDecorator.stories.tsx`
