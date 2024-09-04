import { defineComponent } from '@ir-engine/ecs'

export interface BorderRadius {
  topLeft: number
  topRight: number
  bottomLeft: number
  bottomRight: number
}

export const HTMLComponent = defineComponent({
  name: 'HTMLComponent',

  onInit: () => ({
    describe: {
      element: null as HTMLElement | null,

      style: {
        width: null as number | null,
        height: null as number | null,
        borderRadius: null as BorderRadius | null,
        backgroundColor: null as string | null,
        color: null as string | null,
        fontSize: null as number | null,
        padding: null as number | null,
        margin: null as number | null
      },

      content: {
        text: null as string | null,
        html: null as string | null
      },

      events: {
        onClick: null as (() => void) | null,
        onHover: null as (() => void) | null
      },

      rendering: {
        visible: true,
        opacity: 1
      }
    }
  }),

  reactor: () => {
    // ... (reactor logic, if any)
    return null
  }
})
