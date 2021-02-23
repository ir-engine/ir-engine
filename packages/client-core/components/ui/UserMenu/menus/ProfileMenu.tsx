import React, { useState } from 'react';
import { TextField, Button, Typography, InputAdornment, } from '@material-ui/core';
import { Send, GitHub, Check, Create } from '@material-ui/icons';
import { validateEmail, validatePhoneNumber } from '../../../../redux/helper';
import { FacebookIcon } from '../../Icons/FacebookIcon';
import { GoogleIcon } from '../../Icons/GoogleIcon';
import { LinkedInIcon } from '../../Icons/LinkedInIcon';
import { TwitterIcon } from '../../Icons/TwitterIcon';
import { getAvatarURL, Views } from '../util';
import styles from '../style.module.scss';

const ProfileMenu = (props: any): any => {
	const [ emailPhone, setEmailPhone ] = useState('');
	const [ error, setError ] = useState(false);
	const [ errorUsername, setErrorUsername] = useState(false);

	let type = '';

	const updateUserName = (e) => {
		e.preventDefault();
		props.updateUsername();
	}

	const handleUsernameChange = (e) => {
		props.setUsername(e.target.value);
		if (!e.target.value) setErrorUsername(true);
	}

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
	}

	const handleSubmit = (e: any): any => {
		e.preventDefault();
		if (!validate()) return;
		if (type === 'email') props.addConnectionByEmail(emailPhone, props.userId);
		else if (type === 'sms') props.addConnectionBySms(emailPhone, props.userId);

		return;
	};

	const handleOAuthServiceClick = (e) => {
		props.loginUserByOAuth(e.currentTarget.id);
	}

	return (
		<div className={styles.menuPanel}>
			<section className={styles.profilePanel}>
				<section className={styles.profileBlock}>
					<div className={styles.avatarBlock}>
						<img src={getAvatarURL(props.avatarId)} />
						<Button className={styles.avatarBtn} onClick={() => props.changeActiveMenu(Views.Avatar)} disableRipple><Create /></Button>
					</div>
					<div className={styles.headerBlock}>
						<span className={styles.inputBlock}>
							<TextField
								margin="none"
								size="small"
								label="Username"
								name="username"
								variant="outlined"
								value={props.username || ''}
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
						<h2>You are a <span>{props.userRole}</span>.</h2>
					</div>
				</section>
				<section className={styles.emailPhoneSection}>
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
				</section>
				<section className={styles.socialBlock}>
					<Typography variant="h3" className={styles.textBlock}>Or connect with social accounts</Typography>
					<div className={styles.socialContainer}>
						<a href="#" id="facebook" onClick={handleOAuthServiceClick}><FacebookIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="google" onClick={handleOAuthServiceClick}><GoogleIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="linkedin" onClick={handleOAuthServiceClick}><LinkedInIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="twitter" onClick={handleOAuthServiceClick}><TwitterIcon width="40" height="40" viewBox="0 0 40 40" /></a>
						<a href="#" id="github" onClick={handleOAuthServiceClick}><GitHub /></a>
					</div>
					<Typography variant="h4" className={styles.smallTextBlock}>If you don’t have an account, a new one will be created for you.</Typography>
				</section>
			</section>
		</div>
	);
};

export default ProfileMenu;