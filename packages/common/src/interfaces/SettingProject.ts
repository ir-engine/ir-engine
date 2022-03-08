export interface SettingProject {
  id: string
  settings: ProjectSetting[]
}

export interface ProjectSetting {
  keyName?: string
  value?: any
  scopes?: Array<any>
}
