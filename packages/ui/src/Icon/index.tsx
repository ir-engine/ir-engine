import React, { ReactNode } from 'react'

import {
  Accessibility,
  AccessibilityNew,
  AccountCircle,
  Add,
  AdminPanelSettings,
  Anchor,
  ArrowBack,
  ArrowBackIos,
  ArrowDropDown,
  ArrowForwardIos,
  Autorenew,
  Block,
  BlurLinear,
  BlurOff,
  CachedOutlined,
  CalendarViewDay,
  Cancel,
  CancelOutlined,
  Chat,
  ChatBubble,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  CleaningServices,
  Clear,
  Close,
  CloudUpload,
  Code,
  ContactMail,
  ContentCopy,
  Create,
  CrisisAlert,
  Dashboard,
  Delete,
  Difference,
  DirectionsRun,
  Download,
  Edit,
  Email,
  ErrorOutline,
  ExpandMore,
  Face,
  Facebook,
  FacebookOutlined,
  FaceRetouchingOff,
  FileCopy,
  FileUpload,
  FilterList,
  FormatColorFill,
  FormatColorReset,
  FullscreenExit,
  GitHub,
  Google,
  GridOn,
  Group,
  GroupAdd,
  Groups,
  Help,
  HighlightOff,
  HowToReg,
  Hub,
  IosShare,
  KeyboardArrowDown,
  KeyboardArrowUp,
  KeyboardDoubleArrowDown,
  KeyboardDoubleArrowUp,
  Launch,
  Link,
  LinkedIn,
  LinkOff,
  List,
  ListAlt,
  LocationOn,
  Lock,
  LockOutlined,
  MailOutline,
  Menu,
  Message,
  Mic,
  MicOff,
  Mouse,
  NavigateBefore,
  NavigateNext,
  NearMe,
  Newspaper,
  People,
  PermIdentity,
  PermMedia,
  Person,
  PersonAdd,
  Phone,
  Portrait,
  QrCode2,
  RecordVoiceOver,
  Refresh,
  Report,
  Save,
  ScreenShare,
  ScreenshotMonitor,
  Search,
  SelectAll,
  SelfImprovement,
  Send,
  Settings,
  Shuffle,
  SquareFoot,
  StopScreenShare,
  Storage,
  SupervisorAccount,
  SurroundSound,
  Sync,
  SystemUpdateAlt,
  TextSnippet,
  ThumbUp,
  Timeline,
  TouchApp,
  Toys,
  Twitter,
  Upload,
  Videocam,
  VideocamOff,
  ViewCompact,
  ViewInAr,
  Visibility,
  VisibilityOff,
  VoiceOverOff,
  VolumeDown,
  VolumeMute,
  VolumeOff,
  VolumeUp,
  WarningAmber,
  ZoomOutMap
} from '@mui/icons-material'
import { SvgIconProps } from '@mui/material'

const Icon = ({ type, ...props }: SvgIconProps & { type: string }) => {
  switch (type) {
    default:
      console.log(`----------------Icon type not found: ${type}`)
      return <CrisisAlert {...props} />
    case 'AccessibilityNew':
      return <AccessibilityNew {...props} />
    case 'default':
      return <ThumbUp {...props} />
    case 'Save':
      return <Save {...props} />
    case 'Sync':
      return <Sync {...props} />
    case 'Download':
      return <Download {...props} />
    case 'ChevronLeft':
      return <ChevronLeft {...props} />
    case 'ChevronRight':
      return <ChevronRight {...props} />
    case 'CrisisAlert':
      return <CrisisAlert {...props} />
    case 'Delete':
      return <Delete {...props} />
    case 'Search':
      return <Search {...props} />
    case 'FilterList':
      return <FilterList {...props} />
    case 'Face':
      return <Face {...props} />
    case 'Mouse':
      return <Mouse {...props} />
    case 'AccountCircle':
      return <AccountCircle {...props} />
    case 'Portrait':
      return <Portrait {...props} />
    case 'Help':
      return <Help {...props} />
    case 'Autorenew':
      return <Autorenew {...props} />
    case 'Edit':
      return <Edit {...props} />
    case 'ExpandMore':
      return <ExpandMore {...props} />
    case 'ContentCopy':
      return <ContentCopy {...props} />
    case 'Send':
      return <Send {...props} />
    case 'IosShare':
      return <IosShare {...props} />
    case 'SurroundSound':
      return <SurroundSound {...props} />
    case 'VolumeUp':
      return <VolumeUp {...props} />
    case 'VolumeOff':
      return <VolumeOff {...props} />
    case 'MicOff':
      return <MicOff {...props} />
    case 'Mic':
      return <Mic {...props} />
    case 'BlurLinear':
      return <BlurLinear {...props} />
    case 'Check':
      return <Check {...props} />
    case 'List':
      return <List {...props} />
    case 'Difference':
      return <Difference {...props} />
    case 'WarningAmber':
      return <WarningAmber {...props} />
    case 'CheckCircle':
      return <CheckCircle {...props} />
    case 'Cancel':
      return <Cancel {...props} />
    case 'CancelOutlined':
      return <CancelOutlined {...props} />
    case 'RecordVoiceOver':
      return <RecordVoiceOver {...props} />
    case 'Videocam':
      return <Videocam {...props} />
    case 'VideocamOff':
      return <VideocamOff {...props} />
    case 'VoiceOverOff':
      return <VoiceOverOff {...props} />
    case 'VolumeDown':
      return <VolumeDown {...props} />
    case 'VolumeMute':
      return <VolumeMute {...props} />
    case 'ViewInAr':
      return <ViewInAr {...props} />
    case 'ScreenShare':
      return <ScreenShare {...props} />
    case 'ZoomOutMap':
      return <ZoomOutMap {...props} />
    case 'FullscreenExit':
      return <FullscreenExit {...props} />
    case 'Launch':
      return <Launch {...props} />
    case 'NavigateNext':
      return <NavigateNext {...props} />
    case 'NavigateBefore':
      return <NavigateBefore {...props} />
    case 'Chat':
      return <Chat {...props} />
    case 'FaceRetouchingOff':
      return <FaceRetouchingOff {...props} />
    case 'StopScreenShare':
      return <StopScreenShare {...props} />
    case 'Refresh':
      return <Refresh {...props} />
    case 'Report':
      return <Report {...props} />
    case 'ScreenshotMonitor':
      return <ScreenshotMonitor {...props} />
    case 'AdminPanelSettings':
      return <AdminPanelSettings {...props} />
    case 'GitHub':
      return <GitHub {...props} />
    case 'Block':
      return <Block {...props} />
    case 'ContactMail':
      return <ContactMail {...props} />
    case 'People':
      return <People {...props} />
    case 'ArrowBackIos':
      return <ArrowBackIos {...props} />
    case 'ArrowForwardIos':
      return <ArrowForwardIos {...props} />
    case 'Create':
      return <Create {...props} />
    case 'ArrowBack':
      return <ArrowBack {...props} />
    case 'PersonAdd':
      return <PersonAdd {...props} />
    case 'CloudUpload':
      return <CloudUpload {...props} />
    case 'SystemUpdateAlt':
      return <SystemUpdateAlt {...props} />
    case 'FileCopy':
      return <FileCopy {...props} />
    case 'Newspaper':
      return <Newspaper {...props} />
    case 'KeyboardArrowUp':
      return <KeyboardArrowUp {...props} />
    case 'KeyboardArrowDown':
      return <KeyboardArrowDown {...props} />
    case 'QrCode2':
      return <QrCode2 {...props} />
    case 'Group':
      return <Group {...props} />
    case 'GroupAdd':
      return <GroupAdd {...props} />
    case 'Groups':
      return <Groups {...props} />
    case 'Close':
      return <Close {...props} />
    case 'Menu':
      return <Menu {...props} />
    case 'Code':
      return <Code {...props} />
    case 'ViewCompact':
      return <ViewCompact {...props} />
    case 'FormatColorFill':
      return <FormatColorFill {...props} />
    case 'Hub':
      return <Hub {...props} />
    case 'ListAlt':
      return <ListAlt {...props} />
    case 'MailOutline':
      return <MailOutline {...props} />
    case 'Lock':
      return <Lock {...props} />
    case 'Message':
      return <Message {...props} />
    case 'HowToReg':
      return <HowToReg {...props} />
    case 'Accessibility':
      return <Accessibility {...props} />
    case 'Add':
      return <Add {...props} />
    case 'Anchor':
      return <Anchor {...props} />
    case 'ArrowDropDown':
      return <ArrowDropDown {...props} />
    case 'BlurOff':
      return <BlurOff {...props} />
    case 'CachedOutlined':
      return <CachedOutlined {...props} />
    case 'ChatBubble':
      return <ChatBubble {...props} />
    case 'CleaningServices':
      return <CleaningServices {...props} />
    case 'Clear':
      return <Clear {...props} />
    case 'Email':
      return <Email {...props} />
    case 'ErrorOutline':
      return <ErrorOutline {...props} />
    case 'Facebook':
      return <Facebook {...props} />
    case 'FacebookOutlined':
      return <FacebookOutlined {...props} />
    case 'FileUpload':
      return <FileUpload {...props} />
    case 'FormatColorReset':
      return <FormatColorReset {...props} />
    case 'Google':
      return <Google {...props} />
    case 'GridOn':
      return <GridOn {...props} />
    case 'HighlightOff':
      return <HighlightOff {...props} />
    case 'KeyboardDoubleArrowDown':
      return <KeyboardDoubleArrowDown {...props} />
    case 'KeyboardDoubleArrowUp':
      return <KeyboardDoubleArrowUp {...props} />
    case 'Link':
      return <Link {...props} />
    case 'LinkedIn':
      return <LinkedIn {...props} />
    case 'LinkOff':
      return <LinkOff {...props} />
    case 'LocationOn':
      return <LocationOn {...props} />
    case 'LockOutlined':
      return <LockOutlined {...props} />
    case 'PermIdentity':
      return <PermIdentity {...props} />
    case 'Person':
      return <Person {...props} />
    case 'SelectAll':
      return <SelectAll {...props} />
    case 'Settings':
      return <Settings {...props} />
    case 'SquareFoot':
      return <SquareFoot {...props} />
    case 'TextSnippet':
      return <TextSnippet {...props} />
    case 'TouchApp':
      return <TouchApp {...props} />
    case 'Twitter':
      return <Twitter {...props} />
    case 'Upload':
      return <Upload {...props} />
    case 'Visibility':
      return <Visibility {...props} />
    case 'VisibilityOff':
      return <VisibilityOff {...props} />
    case 'Dashboard':
      return <Dashboard {...props} />
    case 'Storage':
      return <Storage {...props} />
    case 'Shuffle':
      return <Shuffle {...props} />
    case 'NearMe':
      return <NearMe {...props} />
    case 'DirectionsRun':
      return <DirectionsRun {...props} />
    case 'CalendarViewDay':
      return <CalendarViewDay {...props} />
    case 'SupervisorAccount':
      return <SupervisorAccount {...props} />
    case 'PermMedia':
      return <PermMedia {...props} />
    case 'Timeline':
      return <Timeline {...props} />
    case 'Toys':
      return <Toys {...props} />
    case 'Phone':
      return <Phone {...props} />
  }
}

Icon.displayName = 'Icon'

Icon.defaultProps = {
  type: 'default'
}

export default Icon
