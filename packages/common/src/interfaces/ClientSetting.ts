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
  appBackground: string
  appTitle: string
  appSubtitle: string
  appDescription: string
  appSocialLinks: Array<SocialLink>
  themeSettings: ThemeSetting
}

interface SocialLink {
  link: string
  icon: string
}

interface ThemeSetting {
  light: ThemeOptions
  dark: ThemeOptions
}

interface ThemeOptions {
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
  iconButtonSelected: string
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
  dropdownMenuBackground: string
  drawerBackground: string
  themeSwitchTrack: string
  themeSwitchThumb: string
}

export interface PatchClientSetting {
  logo: string
  title: string
  icon192px: string
  icon512px: string
  favicon16px: string
  favicon32px: string
  siteDescription: string
  appBackground: string
  appTitle: string
  appSubtitle: string
  appDescription: string
  appSocialLinks: string
  themeSettings: string
}
