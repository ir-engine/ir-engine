/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'

import Accessibility from '@mui/icons-material/Accessibility'
import AccessibilityNew from '@mui/icons-material/AccessibilityNew'
import AccountCircle from '@mui/icons-material/AccountCircle'
import Add from '@mui/icons-material/Add'
import AdminPanelSettings from '@mui/icons-material/AdminPanelSettings'
import Anchor from '@mui/icons-material/Anchor'
import ArrowBack from '@mui/icons-material/ArrowBack'
import ArrowBackIos from '@mui/icons-material/ArrowBackIos'
import ArrowDropDown from '@mui/icons-material/ArrowDropDown'
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos'
import Autorenew from '@mui/icons-material/Autorenew'
import Block from '@mui/icons-material/Block'
import BlurLinear from '@mui/icons-material/BlurLinear'
import BlurOff from '@mui/icons-material/BlurOff'
import CachedOutlined from '@mui/icons-material/CachedOutlined'
import CalendarViewDay from '@mui/icons-material/CalendarViewDay'
import Call from '@mui/icons-material/Call'
import CallEnd from '@mui/icons-material/CallEnd'
import CameraAlt from '@mui/icons-material/CameraAlt'
import Cancel from '@mui/icons-material/Cancel'
import CancelOutlined from '@mui/icons-material/CancelOutlined'
import Chat from '@mui/icons-material/Chat'
import ChatBubble from '@mui/icons-material/ChatBubble'
import Check from '@mui/icons-material/Check'
import CheckCircle from '@mui/icons-material/CheckCircle'
import ChevronLeft from '@mui/icons-material/ChevronLeft'
import ChevronRight from '@mui/icons-material/ChevronRight'
import CleaningServices from '@mui/icons-material/CleaningServices'
import Clear from '@mui/icons-material/Clear'
import Close from '@mui/icons-material/Close'
import CloudUpload from '@mui/icons-material/CloudUpload'
import Code from '@mui/icons-material/Code'
import ContactMail from '@mui/icons-material/ContactMail'
import ContentCopy from '@mui/icons-material/ContentCopy'
import Create from '@mui/icons-material/Create'
import CrisisAlert from '@mui/icons-material/CrisisAlert'
import Dashboard from '@mui/icons-material/Dashboard'
import Delete from '@mui/icons-material/Delete'
import Difference from '@mui/icons-material/Difference'
import DirectionsRun from '@mui/icons-material/DirectionsRun'
import Dns from '@mui/icons-material/Dns'
import Download from '@mui/icons-material/Download'
import Edit from '@mui/icons-material/Edit'
import Email from '@mui/icons-material/Email'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import ExpandMore from '@mui/icons-material/ExpandMore'
import Face from '@mui/icons-material/Face'
import FaceRetouchingOff from '@mui/icons-material/FaceRetouchingOff'
import Facebook from '@mui/icons-material/Facebook'
import FacebookOutlined from '@mui/icons-material/FacebookOutlined'
import FileCopy from '@mui/icons-material/FileCopy'
import FileUpload from '@mui/icons-material/FileUpload'
import FilterList from '@mui/icons-material/FilterList'
import FlipCameraAndroid from '@mui/icons-material/FlipCameraAndroid'
import FormatColorFill from '@mui/icons-material/FormatColorFill'
import FormatColorReset from '@mui/icons-material/FormatColorReset'
import FullscreenExit from '@mui/icons-material/FullscreenExit'
import GitHub from '@mui/icons-material/GitHub'
import Google from '@mui/icons-material/Google'
import GridOn from '@mui/icons-material/GridOn'
import Group from '@mui/icons-material/Group'
import GroupAdd from '@mui/icons-material/GroupAdd'
import Groups from '@mui/icons-material/Groups'
import Help from '@mui/icons-material/Help'
import HighlightOff from '@mui/icons-material/HighlightOff'
import HowToReg from '@mui/icons-material/HowToReg'
import Hub from '@mui/icons-material/Hub'
import IosShare from '@mui/icons-material/IosShare'
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp'
import KeyboardDoubleArrowDown from '@mui/icons-material/KeyboardDoubleArrowDown'
import KeyboardDoubleArrowUp from '@mui/icons-material/KeyboardDoubleArrowUp'
import Launch from '@mui/icons-material/Launch'
import Link from '@mui/icons-material/Link'
import LinkOff from '@mui/icons-material/LinkOff'
import LinkedIn from '@mui/icons-material/LinkedIn'
import List from '@mui/icons-material/List'
import ListAlt from '@mui/icons-material/ListAlt'
import LocationOn from '@mui/icons-material/LocationOn'
import Lock from '@mui/icons-material/Lock'
import LockOutlined from '@mui/icons-material/LockOutlined'
import MailOutline from '@mui/icons-material/MailOutline'
import Menu from '@mui/icons-material/Menu'
import Message from '@mui/icons-material/Message'
import Mic from '@mui/icons-material/Mic'
import MicOff from '@mui/icons-material/MicOff'
import Mouse from '@mui/icons-material/Mouse'
import NavigateBefore from '@mui/icons-material/NavigateBefore'
import NavigateNext from '@mui/icons-material/NavigateNext'
import NearMe from '@mui/icons-material/NearMe'
import Newspaper from '@mui/icons-material/Newspaper'
import People from '@mui/icons-material/People'
import PermIdentity from '@mui/icons-material/PermIdentity'
import PermMedia from '@mui/icons-material/PermMedia'
import Person from '@mui/icons-material/Person'
import PersonAdd from '@mui/icons-material/PersonAdd'
import PersonOff from '@mui/icons-material/PersonOff'
import Phone from '@mui/icons-material/Phone'
import Poll from '@mui/icons-material/Poll'
import Portrait from '@mui/icons-material/Portrait'
import QrCode2 from '@mui/icons-material/QrCode2'
import RecordVoiceOver from '@mui/icons-material/RecordVoiceOver'
import Refresh from '@mui/icons-material/Refresh'
import Report from '@mui/icons-material/Report'
import Save from '@mui/icons-material/Save'
import ScreenShare from '@mui/icons-material/ScreenShare'
import ScreenshotMonitor from '@mui/icons-material/ScreenshotMonitor'
import Search from '@mui/icons-material/Search'
import SelectAll from '@mui/icons-material/SelectAll'
import Send from '@mui/icons-material/Send'
import Settings from '@mui/icons-material/Settings'
import Shuffle from '@mui/icons-material/Shuffle'
import SmartToy from '@mui/icons-material/SmartToy'
import SportsScore from '@mui/icons-material/SportsScore'
import SquareFoot from '@mui/icons-material/SquareFoot'
import StopCircle from '@mui/icons-material/StopCircle'
import StopScreenShare from '@mui/icons-material/StopScreenShare'
import Storage from '@mui/icons-material/Storage'
import SupervisorAccount from '@mui/icons-material/SupervisorAccount'
import SurroundSound from '@mui/icons-material/SurroundSound'
import Sync from '@mui/icons-material/Sync'
import SystemUpdateAlt from '@mui/icons-material/SystemUpdateAlt'
import TextSnippet from '@mui/icons-material/TextSnippet'
import ThumbUp from '@mui/icons-material/ThumbUp'
import Timeline from '@mui/icons-material/Timeline'
import TouchApp from '@mui/icons-material/TouchApp'
import Toys from '@mui/icons-material/Toys'
import Twitter from '@mui/icons-material/Twitter'
import Upload from '@mui/icons-material/Upload'
import Videocam from '@mui/icons-material/Videocam'
import VideocamOff from '@mui/icons-material/VideocamOff'
import ViewCompact from '@mui/icons-material/ViewCompact'
import ViewInAr from '@mui/icons-material/ViewInAr'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import VoiceOverOff from '@mui/icons-material/VoiceOverOff'
import VolumeDown from '@mui/icons-material/VolumeDown'
import VolumeMute from '@mui/icons-material/VolumeMute'
import VolumeOff from '@mui/icons-material/VolumeOff'
import VolumeUp from '@mui/icons-material/VolumeUp'
import WarningAmber from '@mui/icons-material/WarningAmber'
import ZoomOutMap from '@mui/icons-material/ZoomOutMap'
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
    case 'CameraAlt':
      return <CameraAlt {...props} />
    case 'StopCircle':
      return <StopCircle {...props} />
    case 'ChevronLeft':
      return <ChevronLeft {...props} />
    case 'ChevronRight':
      return <ChevronRight {...props} />
    case 'CrisisAlert':
      return <CrisisAlert {...props} />
    case 'Delete':
      return <Delete {...props} />
    case 'Dns':
      return <Dns {...props} />
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
    case 'PersonOff':
      return <PersonOff {...props} />
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
    case 'Call':
      return <Call {...props} />
    case 'CallEnd':
      return <CallEnd {...props} />
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
    case 'SportsScore':
      return <SportsScore {...props} />
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
    case 'SmartToy':
      return <SmartToy {...props} />
    case 'Phone':
      return <Phone {...props} />
    case 'FlipCameraAndroid':
      return <FlipCameraAndroid {...props} />
    case 'Poll':
      return <Poll {...props} />
  }
}

Icon.displayName = 'Icon'

Icon.defaultProps = {
  type: 'default'
}

export default Icon
