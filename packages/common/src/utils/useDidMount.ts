import { useEffect, useRef } from 'react'

export const useDidMount = (func: () => void, deps: any[] = []) => {
  const didMount = useRef(false)

  useEffect(() => {
    if (didMount.current) func()
    else didMount.current = true
  }, deps)
}
