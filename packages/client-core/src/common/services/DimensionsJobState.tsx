import { defineState } from '@ir-engine/hyperflux'
import React from 'react'
type DimensionJob = {
  key: string
  project: string // the project name
  id: string // the existing static resource ID
}
export const DimensionsJobState = defineState({
  name: 'DimensionsJobState',
  initial: [] as DimensionJob[],
  reactor: () => <DimensionsReactor />
})
const DimensionsReactor = () => {
  return null
}
