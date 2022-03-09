export interface ClientSetting {
  id: string
  logo: string
  title: string
  url: string
  releaseName?: string
  siteDescription: string
  favicon32px: string
  favicon16px: string
  icon192px: string
  icon512px: string
}

export interface PatchClientSetting {
  logo: string
  title: string
  icon192px: string
  icon512px: string
  favicon16px: string
  favicon32px: string
  siteDescription: string
}
