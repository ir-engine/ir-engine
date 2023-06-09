export interface ClientSetting {
  id: string
  logo: string
  title: string
  shortTitle: string
  startPath: string
  url: string
  releaseName?: string
  siteDescription: string
  favicon32px: string
  favicon16px: string
  icon192px: string
  icon512px: string
  webmanifestLink: string
  swScriptLink: string
  appBackground: string
  appTitle: string
  appSubtitle: string
  appDescription: string
  appSocialLinks: Array<SocialLink>
  themeSettings: ThemeSetting
  themeModes: ThemeMode
  key8thWall: string
  homepageLinkButtonEnabled: boolean
  homepageLinkButtonRedirect: string
  homepageLinkButtonText: string
}

interface SocialLink {
  link: string
  icon: string
}

export interface ThemeMode {
  [key: string]: string
}

export interface ThemeSetting {
  [key: string]: ThemeOptions
}

export interface ThemeOptions {
  textColor: string
  navbarBackground: string
  sidebarBackground: string
  sidebarSelectedBackground: string
  mainBackground: string
  panelBackground: string
  panelCards: string
  panelCardHoverOutline: string
  panelCardIcon: string
  textHeading: string
  textSubheading: string
  textDescription: string
  iconButtonColor: string
  iconButtonHoverColor: string
  iconButtonBackground: string
  iconButtonSelectedBackground: string
  buttonOutlined: string
  buttonFilled: string
  buttonGradientStart: string
  buttonGradientEnd: string
  buttonTextColor: string
  scrollbarThumbXAxisStart: string
  scrollbarThumbXAxisEnd: string
  scrollbarThumbYAxisStart: string
  scrollbarThumbYAxisEnd: string
  scrollbarCorner: string
  inputOutline: string
  inputBackground: string
  primaryHighlight: string
  dropdownMenuBackground: string
  dropdownMenuHoverBackground: string
  dropdownMenuSelectedBackground: string
  drawerBackground: string
  popupBackground: string
  tableHeaderBackground: string
  tableCellBackground: string
  tableFooterBackground: string
  dockBackground: string
}

export interface PatchClientSetting {
  logo: string
  title: string
  shortTitle: string
  startPath: string
  icon192px: string
  icon512px: string
  favicon16px: string
  favicon32px: string
  webmanifestLink: string
  swScriptLink: string
  siteDescription: string
  appBackground: string
  appTitle: string
  appSubtitle: string
  appDescription: string
  appSocialLinks: string
  themeSettings: string
  themeModes: string
  key8thWall: string
  homepageLinkButtonEnabled: boolean
  homepageLinkButtonRedirect: string
  homepageLinkButtonText: string
}
