import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { Check, Close, Create, GitHub, Send } from '@material-ui/icons';
import { selectAuthState } from '../../../reducers/auth/selector';
import { addConnectionByEmail, addConnectionBySms, loginUserByOAuth, logoutUser, removeUser, updateUserAvatarId, updateUsername, updateUserSettings } from '../../../reducers/auth/service';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import React, { useEffect, useState } from 'react';
import { connect } from "react-redux";
import { bindActionCreators, Dispatch } from 'redux';
import { FacebookIcon } from '../../../../common/components/Icons/FacebookIcon';
import { GoogleIcon } from '../../../../common/components/Icons/GoogleIcon';
import { LinkedInIcon } from '../../../../common/components/Icons/LinkedInIcon';
import { TwitterIcon } from '../../../../common/components/Icons/TwitterIcon';
import { getAvatarURLFromNetwork, Views } from '../util';
import { Config, validateEmail, validatePhoneNumber } from '../../../../helper';
import * as polyfill from 'credential-handler-polyfill';

//@ts-ignore
// @ts-ignore
import styles from '../style.module.scss';

interface Props {
	changeActiveMenu?: any;
	setProfileMenuOpen?: any;
	authState?: any;
	updateUsername?: any;
	updateUserAvatarId?: any;
	updateUserSettings?: any;
	loginUserByOAuth?: any;
	addConnectionBySms?: any;
	addConnectionByEmail?: any;
	logoutUser?: any;
	removeUser?: any;
}

const mapStateToProps = (state: any): any => {
	return {
		authState: selectAuthState(state),
	};
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
	updateUsername: bindActionCreators(updateUsername, dispatch),
	updateUserAvatarId: bindActionCreators(updateUserAvatarId, dispatch),
	updateUserSettings: bindActionCreators(updateUserSettings, dispatch),
	loginUserByOAuth: bindActionCreators(loginUserByOAuth, dispatch),
	addConnectionBySms: bindActionCreators(addConnectionBySms, dispatch),
	addConnectionByEmail: bindActionCreators(addConnectionByEmail, dispatch),
	logoutUser: bindActionCreators(logoutUser, dispatch),
	removeUser: bindActionCreators(removeUser, dispatch),
});

const ProfileMenu = (props: Props): any => {
	const {
		authState,
		updateUsername,
		addConnectionByEmail,
		addConnectionBySms,
		loginUserByOAuth,
		logoutUser,
		changeActiveMenu,
		setProfileMenuOpen
	} = props;

	const selfUser = authState.get('user') || {};

	const [username, setUsername] = useState(selfUser?.name);
	const [ emailPhone, setEmailPhone ] = useState('');
	const [ error, setError ] = useState(false);
	const [ errorUsername, setErrorUsername] = useState(false);

	let type = '';

	const loadCredentialHandler = async () => {
		try {
			let mediator = process.env.NODE_ENV === 'production' ? Config.publicRuntimeConfig.mediatorServer : 'https://authorization.localhost:33443';
			mediator = `${mediator}?origin=${encodeURIComponent(window.location.origin)}`;

			await polyfill.loadOnce();
			console.log('Ready to work with credentials!');
		} catch (e) {
			console.error('Error loading polyfill:', e);
		}
	};

	useEffect(() => {
		loadCredentialHandler();
	}, []); // Only run once

	useEffect(() => {
		selfUser && setUsername(selfUser.name);
	}, [selfUser.name]);

	const updateUserName = (e) => {
		e.preventDefault();
		handleUpdateUsername();
	};

	const handleUsernameChange = (e) => {
		setUsername(e.target.value);
		if (!e.target.value) setErrorUsername(true);
	};

	const handleUpdateUsername = () => {
		const name = username.trim();
		if (!name) return;
		if (selfUser.name.trim() !== name) {
			updateUsername(selfUser.id, name);
		}
	};
	const handleInputChange = (e) => setEmailPhone(e.target.value);

	const validate = () => {
		if (emailPhone === '') return false;
		if (validateEmail(emailPhone.trim())) type = 'email';
		else if (validatePhoneNumber(emailPhone.trim())) type = 'sms'; 
		else {
			setError(true);
			return false;
		}

		setError(false);
		return true;
	};

	const handleSubmit = (e: any): any => {
		e.preventDefault();
		if (!validate()) return;
		if (type === 'email') addConnectionByEmail(emailPhone, selfUser?.id);
		else if (type === 'sms') addConnectionBySms(emailPhone, selfUser?.id);

		return;
	};

	const handleOAuthServiceClick = (e) => {
		loginUserByOAuth(e.currentTarget.id);
	};

	const handleLogout = async (e) => {
		if (changeActiveMenu != null) changeActiveMenu(null);
		else if (setProfileMenuOpen != null) setProfileMenuOpen(false);
		await logoutUser();
		window.location.reload();
	};

	const handleWalletLoginClick = async (e) => {
		const domain = window.location.origin;
		const challenge = '99612b24-63d9-11ea-b99f-4f66f3e4f81a'; // TODO: generate

		console.log('Sending DIDAuth query...');

		const didAuthQuery: any = {
			web: {
				VerifiablePresentation: {
					query: [
						{
							type: 'DIDAuth'
						}
					],
					challenge,
					domain // e.g.: requestingparty.example.com
				}
			}
		};

		// Use Credential Handler API to authenticate
		const result: any = await navigator.credentials.get(didAuthQuery);
		console.log(result);
	};

	return (
		<div className={styles.menuPanel}>
			<section className={styles.profilePanel}>
				<section className={styles.profileBlock}>
					<div className={styles.avatarBlock}>
						<img src={getAvatarURLFromNetwork(Network.instance, selfUser?.id)} />
						{ changeActiveMenu != null && <Button className={styles.avatarBtn} onClick={() => changeActiveMenu(Views.Avatar)} disableRipple><Create /></Button>}
					</div>
					<div className={styles.headerBlock}>
						<span className={styles.inputBlock}>
							<TextField
								margin="none"
								size="small"
								label="Username"
								name="username"
								variant="outlined"
								value={username || ''}
								onChange={handleUsernameChange}
								onKeyDown={(e) => { if (e.key === 'Enter') updateUserName(e); }}
								className={styles.usernameInput}
								error={errorUsername}
								InputProps={{
									endAdornment: (
										<InputAdornment position="end">
											<a href="#" className={styles.materialIconBlock} onClick={updateUserName}>
												<Check className={styles.primaryForeground} />
											</a>
										</InputAdornment>
									),
								}}
							/>
						</span>
						<h2>You are {selfUser?.userRole === 'admin' ? 'an' : 'a'} <span>{selfUser?.userRole}</span>.</h2>
						<h4>{(selfUser.userRole === 'user' || selfUser.userRole === 'admin') && <div onClick={handleLogout}>Log out</div>}</h4>
						{ selfUser?.inviteCode != null && <h2>Invite Code: {selfUser.inviteCode}</h2> }
					</div>
				</section>
				{ selfUser?.userRole === 'guest' && <section className={styles.emailPhoneSection}>
					<Typography variant="h1" className={styles.panelHeader}>
						Connect your email or phone number
					</Typography>

					<form onSubmit={handleSubmit}>
						<TextField
							className={styles.emailField}
							size="small"
							placeholder="Phone Number / Email"
							variant="outlined"
							onChange={handleInputChange}
							onBlur={validate}
							error={error}
							helperText={error ? "Valid Email or Phone number is required" : null}
							InputProps={{
								endAdornment: (
									<InputAdornment position="end" onClick={handleSubmit}>
										<a href="#" className={styles.materialIconBlock}>
											<Send className={styles.primaryForeground} />
										</a>
									</InputAdornment>
								),
							}}
						/>
					</form>
				</section>}
				{ selfUser?.userRole === 'guest' && <section className={styles.walletSection}>
					<Typography variant="h3" className={styles.textBlock}>Or</Typography>
					<Button onClick={handleWalletLoginClick} className={styles.walletBtn}>
						Login with Wallet
					</Button>
				</section>}
				{ selfUser?.userRole === 'guest' && <section className={styles.socialBlock}>
					<Typography variant="h3" className={styles.textBlock}>Or connect with social accounts</Typography>
					<div className={styles.socialContainer}>
						<a href="#" id="facebook" onClick={handleOAuthServiceClick}><FacebookIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="google" onClick={handleOAuthServiceClick}><GoogleIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="linkedin2" onClick={handleOAuthServiceClick}><LinkedInIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="twitter" onClick={handleOAuthServiceClick}><TwitterIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="github" onClick={handleOAuthServiceClick}><GitHub /></a>
					</div>
					<Typography variant="h4" className={styles.smallTextBlock}>If you don’t have an account, a new one will be created for you.</Typography>
				</section>}
				{ setProfileMenuOpen != null && <div className={styles.closeButton} onClick={() => setProfileMenuOpen(false)}><Close /></div>}
			</section>
		</div>
	);
};

export default connect(mapStateToProps, mapDispatchToProps)(ProfileMenu);