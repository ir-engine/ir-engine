# Input System

The input system provides a flexible and extensible way to handle user input across different devices and platforms. It supports keyboard, mouse, gamepad, and XR controller inputs through a unified interface.

## Core Concepts

### Input Components

- `InputComponent`: The main component that handles input binding and state management
- `InputSourceComponent`: Represents a source of input (e.g., keyboard, mouse, gamepad)
- `InputSinkComponent`: Represents an entity that can receive input
- `InputPointerComponent`: Handles pointer/mouse input state

### Button States

The input system provides several button states that can be used to create responsive and intuitive interactions:

- `pressed`: True for exactly one frame when the button is first pressed
- `down`: True while the button is held down
- `up`: True for exactly one frame when the button is released
- `dragging`: True when the button is held down and the input source is moving
- `touched`: True when the button is first touched (for touch inputs)
- `value`: A normalized value between 0 and 1 (useful for analog inputs)
- `consumed`: The entity that consumed this input (prevents multiple entities from handling the same input)

#### Usage Examples

```typescript
const buttons = InputComponent.getButtons(entity)

// Handle click
if (buttons.Interact?.pressed) {
  // Handle initial press
}

// Handle hold
if (buttons.Interact?.down) {
  // Handle continuous press
}

// Handle release
if (buttons.Interact?.up) {
  // Handle button release
}

// Handle drag
if (buttons.Interact?.dragging) {
  // Handle drag movement
}

// Handle analog input
if (buttons.Trigger?.value) {
  // Handle analog trigger pressure
}
```

#### Common Patterns

1. **Click Detection**:
```typescript
if (buttons.Interact?.up && !buttons.Interact.dragging) {
  // Handle click (press and release without dragging)
}
```

2. **Drag Detection**:
```typescript
if (buttons.PrimaryClick?.dragging) {
  const pointer = getOptionalComponent(buttons.PrimaryClick.inputSourceEntity, InputPointerComponent)
  if (pointer) {
    // Handle 2D pointer movement
  }
}
```

3. **Analog Control**:
```typescript
const triggerValue = buttons.Trigger?.value ?? 0
// Use normalized value for smooth control
```

## Usage

### Basic Setup

1. Add `InputComponent` to entities that need to handle input:

```typescript
import { InputComponent } from '@ir-engine/spatial'

// Add to entity
setComponent(entity, InputComponent)
```

2. Define input bindings:

```typescript
const MyButtonBindings = {
  Interact: [MouseButton.PrimaryClick, XRStandardGamepadButton.XRStandardGamepadTrigger],
  Jump: [KeyboardButton.Space]
} satisfies InputButtonBindings

const MyAxisBindings = {
  Move: [XRStandardGamepadAxes.XRStandardGamepadThumbstickX],
  Look: [XRStandardGamepadAxes.XRStandardGamepadThumbstickY]
} satisfies InputAxisBindings
```

### Handling Input

1. Get button states:

```typescript
const buttons = InputComponent.getButtons(entity, MyButtonBindings)
if (buttons.Interact?.pressed) {
  // Handle interaction
}
```

2. Get axis values:

```typescript
const axes = InputComponent.getAxes(entity, MyAxisBindings)
const movement = axes.Move
const look = axes.Look
```

### Best Practices

1. **Input Execution Order**:
   - Use `InputExecutionOrder` to control when input is processed
   - Options: `Before`, `With`, `After` the input system group

```typescript
InputComponent.useExecuteWithInput(
  () => {
    // Handle input
  },
  InputExecutionOrder.After,
  true // execute when editing
)
```

2. **2D Pointer Input**:
   - Use `InputPointerComponent` to get 2D pointer data (e.g., mouse or touch)

```typescript
const pointer = getOptionalComponent(buttons.PrimaryClick.inputSourceEntity, InputPointerComponent)
if (pointer?.movement) {
  // Handle pointer movement
}
```

## Examples

### Camera Control

```typescript
// In a camera system execute
const buttons = InputComponent.getButtons(cameraEntity)
const axes = InputComponent.getAxes(cameraEntity)

if (buttons.PrimaryClick?.dragging) {
  const pointer = getOptionalComponent(buttons.PrimaryClick.inputSourceEntity, InputPointerComponent)
  if (pointer) {
    // Handle camera rotation based on pointer movement
  }
}

// Handle zoom
const zoom = axes.FollowCameraZoomScroll
if (zoom) {
  // Adjust camera distance
}
```

### Interaction System

```typescript
// In an interactable component
InputComponent.useExecuteWithInput(
  () => {
    const buttons = InputComponent.getButtons(entity)
    if (buttons.Interact?.up && !buttons.Interact.dragging) {
      // Handle interaction
    }
  },
  InputExecutionOrder.After,
  true
)
```

## Architecture

The input system follows a component-based architecture:

1. **Input Sources**: Represent physical input devices
2. **Input Sinks**: Entities that can receive input
3. **Input Components**: Manage input state and bindings
4. **Input Systems**: Process input and update state

This architecture allows for:
- Multiple input sources per entity
- Input capture and focus management
- Flexible binding of inputs to actions
- Cross-platform input handling

## Advanced Usage

### Custom Input Systems

Create custom input systems by extending the base functionality:

```typescript
export const MyInputSystem = defineSystem({
  uuid: 'ee.engine.MyInputSystem',
  insert: { after: InputSystemGroup },
  execute: () => {
    // Process input
  }
})
```

### Input State Management

Use `InputState` for global input management:

```typescript
const inputState = getState(InputState)
const capturingEntity = inputState.capturingEntity

// Check if entity has input focus
const hasFocus = capturingEntity === myEntity
```

### Input Binding Overrides

Override default bindings for specific entities:

```typescript
const customBindings = {
  ...DefaultButtonBindings,
  CustomAction: [KeyboardButton.KeyX]
}

const buttons = InputComponent.getButtons(entity, customBindings)
```