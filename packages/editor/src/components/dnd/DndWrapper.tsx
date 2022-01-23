import React, { PropsWithChildren, useEffect, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

// Dnd wrapper requires when react try to render parent component of DndProvider.
// On second render HTML5Backend is throwing error. So to prevent that this wrapper is created.
export const DndWrapper = React.memo<PropsWithChildren<{ id: string }>>((props) => {
  const [context, setContext] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContext(document.getElementById(props.id))
  }, [props.id])

  return context ? (
    <DndProvider backend={HTML5Backend} options={{ rootElement: context }}>
      {props.children}
    </DndProvider>
  ) : null
})
