import i18n from 'i18next'

import { StaticResourceInterface } from '@xrengine/common/src/interfaces/StaticResourceInterface'

export interface ResourceColumn {
  id: 'id' | 'key' | 'mimeType' | 'staticResourceType' | 'thumbnail' | 'action'
  label: string
  minWidth?: number
  align?: 'right'
}

export const resourceColumns: ResourceColumn[] = [
  { id: 'id', label: i18n.t('admin:components.resources.id'), minWidth: 65 },
  { id: 'key', label: i18n.t('admin:components.resources.key'), minWidth: 65 },
  { id: 'mimeType', label: i18n.t('admin:components.resources.mimeType'), minWidth: 65 },
  { id: 'staticResourceType', label: i18n.t('admin:components.resources.resourceType'), minWidth: 65 },
  {
    id: 'action',
    label: 'Action',
    minWidth: 65,
    align: 'right'
  }
]

export interface ResourceData {
  el: StaticResourceInterface
  id: string
  key: string
  mimeType: string
  staticResourceType: string
  action: JSX.Element
}
