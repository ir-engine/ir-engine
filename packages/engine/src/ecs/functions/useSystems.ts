import { useEffect } from 'react'

import { initSystems, SystemModuleType, unloadSystems } from './SystemFunctions'

export const useSystems = (systems: SystemModuleType<any>[]) => {
  useEffect(() => {
    initSystems(systems)
    return () => {
      unloadSystems(systems.map((s) => s.uuid))
    }
  }, [])
}
