// import Button from '@material-ui/core/Button'
// import InputAdornment from '@mui/material/InputAdornment'
// import TextField from '@mui/material/TextField'
// import Typography from '@mui/material/Typography'
// import { Check, Close, Create, GitHub, Send } from '@mui/icons-material'
// import { useAuthState } from '@xrengine/client-core/src/user/services/AuthService'
// import { AuthService, getStoredAuthState } from '@xrengine/client-core/src/user/services/AuthService'
// import { useCreatorState } from '@xrengine/client-core/src/social/services/CreatorService'
// import { CreatorService } from '@xrengine/client-core/src/social/services/CreatorService'
// import { WebxrNativeService } from '@xrengine/client-core/src/social/services/WebxrNativeService'
// import React, { useEffect, useState } from 'react'
// import { useDispatch } from '@xrengine/client-core/src/store'

// import { FacebookIcon } from '../../../../client-core/src/common/components/Icons/FacebookIcon'
// import { GoogleIcon } from '../../../../client-core/src/common/components/Icons/GoogleIcon'
// import { LinkedInIcon } from '../../../../client-core/src/common/components/Icons/LinkedInIcon'
// import { TwitterIcon } from '../../../../client-core/src/common/components/Icons/TwitterIcon'

// import { Config, validateEmail, validatePhoneNumber } from '@xrengine/common/src/config'
// import * as polyfill from 'credential-handler-polyfill'
// import styles from './Registration.module.scss'
// import { useTranslation } from 'react-i18next'
// import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
// import { useSnackbar, SnackbarOrigin } from 'notistack'

// import { Link, useHistory, Redirect } from 'react-router-dom'
// import ChangedUserName from './ChangedUserName'
// import CloseSnackbarComponent from '../../components/buttons/CloseSnackbarComponent'

// const Registration = (props: any): any => {
//   const {
//     updateUsername,
//     loginUserByOAuth,
//     logoutUser,
//     changeActiveMenu,
//     setRegistrationOpen,

//     doLoginAuto
//   } = props
//   const anchorOrigin: SnackbarOrigin = { horizontal: 'right', vertical: 'top' }

//   const history = useHistory()
//   const dispatch = useDispatch()
//   const { t } = useTranslation()
//   const auth = useAuthState()

//   const selfUser = auth.user
//   console.log(selfUser.userRole.value)

//   // const [username, setUsername] = useState(selfUser?.name)
//   const creatorsState = useCreatorState()
//   const [creator, setCreator] = useState({ ...creatorsState.creators.currentCreator.value })
//   const [emailPhone, setEmailPhone] = useState('')
//   const [error, setError] = useState(false)
//   const [errorUsername, setErrorUsername] = useState(false)
//   const [emailPhoneForm, setEmailPhoneForm] = useState(false)
//   const [continueAsGuest, setContinueAsGuest] = useState(false)
//   const [registrationServiceClick, setRegistrationServiceClick] = useState('')
//   const [disabledButtonLogIn, setDisabledButtonLogIn] = useState(false)

//   let type = ''

//   const loadCredentialHandler = async () => {
//     try {
//       const mediator = `${Config.publicRuntimeConfig.mediatorServer}/mediator?origin=${encodeURIComponent(
//         window.location.origin
//       )}`

//       await polyfill.loadOnce(mediator)
//       // console.log('Ready to work with credentials!')
//     } catch (e) {
//       console.error('Error loading polyfill:', e)
//     }
//   }

//   useEffect(() => {
//     loadCredentialHandler()
//   }, []) // Only run once

//   // useEffect(() => {
//   //   selfUser && setUsername(selfUser.name)
//   // }, [selfUser.name])

//   const updateUserName = (username) => {
//     const creator = creatorsState.creators.currentCreator.value
//     dispatch(
//       CreatorService.updateCreator(
//         {
//           ...creator,
//           username
//         },
//         callBacksFromUpdateUsername
//       )
//     )
//   }
//   const { enqueueSnackbar, closeSnackbar } = useSnackbar()
//   const callBacksFromUpdateUsername = (str: string) => {
//     switch (str) {
//       case 'succes': {
//         const succes = enqueueSnackbar('Data saved successfully', {
//           variant: 'success',
//           anchorOrigin,
//           action: [
//             <CloseSnackbarComponent
//               key="closeSnackbar"
//               handleClose={() => {
//                 closeSnackbar(succes)
//               }}
//             />
//           ]
//         })
//         break
//       }
//       case 'reject': {
//         const reject = enqueueSnackbar('This name is already taken', {
//           variant: 'error',
//           anchorOrigin,
//           action: [
//             <CloseSnackbarComponent
//               key="closeSnackbar"
//               handleClose={() => {
//                 closeSnackbar(reject)
//               }}
//             />
//           ]
//         })
//         break
//       }
//     }
//   }

//   const [crutch, setCrutch] = useState(false)

//   const authData = getStoredAuthState()
//   const accessToken = authData?.authUser ? authData.authUser.accessToken : undefined

//   useEffect(() => {
//     if (accessToken || crutch) {
//       AuthService.doLoginAuto(true)
//       WebxrNativeService.getWebXrNative()
//     }
//   }, [accessToken, crutch])

//   const checkRole = (role: string): boolean => {
//     return role === 'user' || role === 'admin'
//   }

//   useEffect(() => {
//     if (checkRole(selfUser.userRole.value) || (selfUser.id.value !== '' && continueAsGuest)) {
//       history.push('/')
//     } else if (registrationServiceClick?.length > 0 && selfUser.userRole.value === 'guest') {
//       AuthService.loginUserByOAuth(registrationServiceClick)
//     }
//   }, [selfUser.id.value, continueAsGuest, selfUser.userRole.value, registrationServiceClick])

//   useEffect(() => {
//     if (auth?.authUser?.accessToken && auth?.user?.id.value) {
//       CreatorService.createCreator()
//     }
//   }, [auth.isLoggedIn.value, auth.user.id.value])

//   const handleUpdateUsername = () => {
//     CreatorService.updateCreator(creator, callBacksFromUpdateUsername)
//   }
//   const handleInputChange = (e) => setEmailPhone(e.target.value)

//   const validate = () => {
//     if (emailPhone === '') {
//       enqueueSnackbar('Please enter your phone or email', { variant: 'error', anchorOrigin })
//       return false
//     }
//     if (validateEmail(emailPhone.trim())) type = 'email'
//     else if (validatePhoneNumber(emailPhone.trim())) type = 'sms'
//     else {
//       enqueueSnackbar('Data entered incorrectly', { variant: 'error', anchorOrigin })
//       setError(true)
//       return false
//     }

//     setError(false)
//     return true
//   }

//   const handleSubmit = (e: any): any => {
//     e.preventDefault()
//     if (!validate()) return
//     if (type === 'email') {
//       AuthService.addConnectionByEmail(emailPhone, authData.user.id)
//     }
//     if (type === 'sms') {
//       AuthService.addConnectionBySms(emailPhone, authData.user.id)
//     }
//     setDisabledButtonLogIn(true)
//     enqueueSnackbar('Please check your mail', { variant: 'success', anchorOrigin })
//     return
//   }

//   const handleOAuthServiceClick = (e) => {
//     setRegistrationServiceClick(e.currentTarget.id)
//     setCrutch(true)
//   }
//   const handleGoEmailClick = () => {
//     setEmailPhoneForm(!emailPhoneForm)
//     setCrutch(true)
//   }

//   const handleLogout = async (e) => {
//     if (changeActiveMenu != null) changeActiveMenu(null)
//     else if (setRegistrationOpen != null) setRegistrationOpen(false)
//     await logoutUser()
//     // window.location.reload()
//   }

//   return (
//     <div className={styles.menuPanel}>
//       <section className={styles.profilePanel}>
//         <div className={styles.logo}>
//           <span
//             style={{
//               fontSize: 'x-large'
//             }}
//           >
//             {t('social:registration.LogInTo')}
//           </span>
//           <img src="/assets/LogoColored.png" alt="logo" crossOrigin="anonymous" className="logo" />
//         </div>
//         {emailPhoneForm && creatorsState.creators.currentCreator?.username?.value && (
//           <div className={styles.emailPhoneSection}>
//             <div className={styles.socialBack} onClick={handleGoEmailClick}>
//               <ArrowBackIosIcon />
//             </div>
//             <Typography align="center" variant="body1">
//               {t('social:registration.connect')}
//             </Typography>
//             <form onSubmit={handleSubmit}>
//               <ChangedUserName
//                 defaultValue={creatorsState?.creators.currentCreator?.username?.value}
//                 updateUserName={updateUserName}
//               />
//               <TextField
//                 className={styles.emailField}
//                 size="small"
//                 placeholder={t('social:registration.ph-phoneEmail')}
//                 variant="outlined"
//                 onChange={handleInputChange}
//                 onBlur={validate}
//                 error={error}
//                 helperText={error ? t('social:registration.ph-phoneEmail') : null}
//               />
//               <Button
//                 disabled={disabledButtonLogIn}
//                 className={styles.logIn}
//                 variant="contained"
//                 onClick={handleSubmit}
//               >
//                 {t('social:registration.logIn')}
//               </Button>
//             </form>
//           </div>
//         )}
//         {!emailPhoneForm && (
//           <section className={styles.socialBlock}>
//             <div className={styles.socialContainer}>
//               <div
//                 className={styles.socialWrap}
//                 style={{
//                   border: 'none',
//                   justifyContent: 'end'
//                 }}
//               >
//                 <Typography
//                   variant="h3"
//                   className={styles.textBlock}
//                   onClick={() => {
//                     setContinueAsGuest(true)
//                     setCrutch(true)
//                   }}
//                   style={{
//                     border: '1px solid rgba(0, 0, 0, 0.87)',
//                     padding: '15px'
//                   }}
//                 >
//                   {t('social:registration.continueAsGuest')}
//                 </Typography>
//               </div>
//               <div className={styles.socialWrap} onClick={handleGoEmailClick}>
//                 <a href="#">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     xmlnsXlink="http://www.w3.org/1999/xlink"
//                     width="42"
//                     height="42"
//                     viewBox="0 0 42 42"
//                     fill="none"
//                   >
//                     <rect width="42" height="42" transform="matrix(-1 0 0 1 42 0)" fill="url(#pattern0)" />
//                     <defs>
//                       <pattern id="pattern0" patternContentUnits="objectBoundingBox" width="1" height="1">
//                         <use xlinkHref="#image0" transform="scale(0.0208333)" />
//                       </pattern>
//                       <image
//                         id="image0"
//                         width="48"
//                         height="48"
//                         xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAANlBMVEVHcEwAAAAJChIMDBkWGCIOEBcOEBcJCg8QEhwNDxQUFiAAAAAAAAAVFyMDBAYQEhsWGCMAAAD5xs1FAAAAEHRSTlMA7zAQ33+jXkIgxt/B72+Q9PCfEQAAASBJREFUSMftVMsSgyAM5CUEENT//9k2aEesQNLeOtM9EciSLCwI8cd30GDNugbrmPnwzN5hWJRprTB9mM9guD0NhFC2DIEgYP9G7WNfAkYB/4oUXQLbsGe4XMMGwnVLIHvCHuorfItJgiAJpta8q06khul6aGFIyLilfkXlIsZ+0gn3PBga6yXPsJKB07WkmUJxUAohlUGgX4+pzRo8470tZ/6iWU/O29JOssB/1grA//K35LONctvkHDJHB8xbhZn6mdQlHRGHVbLc7sgD5x19ZKXxh81HuWmcP0N95yOGwzX5ptKVJpvSfcR8dTsGZMiWCUt11Tg4nG/8Zr7bbG7vhAViWxwe1nKbjT1tz8tHFbdZ2S3QWXNRdn0zWvtFPAAmbxZPKTUEzQAAAABJRU5ErkJggg=="
//                       />
//                     </defs>
//                   </svg>
//                 </a>
//                 <Typography variant="h3" className={styles.textBlock}>
//                   {t('social:registration.ph-phoneEmail')}
//                 </Typography>
//               </div>
//               <div className={styles.socialWrap} id="facebook" onClick={handleOAuthServiceClick}>
//                 <a href="#">
//                   <FacebookIcon width="40" height="40" viewBox="0 0 40 40" />
//                 </a>
//                 <Typography variant="h3" className={styles.textBlock}>
//                   {t('social:registration.facebook')}
//                 </Typography>
//               </div>
//               <div className={styles.socialWrap} id="google" onClick={handleOAuthServiceClick}>
//                 <a href="#">
//                   <GoogleIcon width="40" height="40" viewBox="0 0 40 40" />
//                 </a>
//                 <Typography variant="h3" className={styles.textBlock}>
//                   {t('social:registration.google')}
//                 </Typography>
//               </div>
//               <div className={styles.socialWrap} id="linkedin2" onClick={handleOAuthServiceClick}>
//                 <a href="#">
//                   <LinkedInIcon width="40" height="40" viewBox="0 0 40 40" />
//                 </a>
//                 <Typography variant="h3" className={styles.textBlock}>
//                   {t('social:registration.linkedin')}
//                 </Typography>
//               </div>
//               <div className={styles.socialWrap} id="twitter" onClick={handleOAuthServiceClick}>
//                 <a href="#">
//                   <TwitterIcon width="40" height="40" viewBox="0 0 40 40" />
//                 </a>
//                 <Typography variant="h3" className={styles.textBlock}>
//                   {t('social:registration.twitter')}
//                 </Typography>
//               </div>
//               <div className={styles.socialWrap} id="github" onClick={handleOAuthServiceClick}>
//                 <a href="#">
//                   <GitHub />
//                 </a>
//                 <Typography variant="h3" className={styles.textBlock}>
//                   {t('social:registration.gitHub')}
//                 </Typography>
//               </div>
//             </div>
//             <Typography variant="h4" className={styles.smallTextBlock}>
//               {t('social:profile.createOne')}
//             </Typography>
//           </section>
//         )}
//       </section>
//     </div>
//   )
// }

// export default Registration
