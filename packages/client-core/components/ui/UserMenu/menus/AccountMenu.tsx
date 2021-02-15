import React, { useState } from 'react';
import { Typography, InputAdornment, TextField } from '@material-ui/core';
import { Send, ArrowBack, GitHub } from '@material-ui/icons';
import { FacebookIcon } from '../../Icons/FacebookIcon';
import { GoogleIcon } from '../../Icons/GoogleIcon';
import { LinkedInIcon } from '../../Icons/LinkedInIcon';
import { TwitterIcon } from '../../Icons/TwitterIcon';
import styles from '../style.module.scss';
import { validateEmail, validatePhoneNumber } from '../../../../redux/helper';

const AccountMenu = (props: any): any => {
	const [ emailPhone, setEmailPhone ] = useState('');
	const [ error, setError ] = useState(false);

	let type = '';

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
			<div className={styles.accountPanel}>
				<Typography variant="h1" className={styles.panelHeader}>
					<a href="#" className={styles.materialIconBlock} onClick={() => props.changeActiveMenu(null)}>
						<ArrowBack />
					</a>
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
									<Send />
								</InputAdornment>
							),
						}}
					/>
				</form>
				<Typography variant="h3" className={styles.textBlock}>Or connect with one of your accounts</Typography>
				<div className={styles.socialContainer}>
					<a href="#" id="facebook" onClick={handleOAuthServiceClick}><FacebookIcon width="40" height="40" viewBox="0 0 40 40" /></a>
					<a href="#" id="google" onClick={handleOAuthServiceClick}><GoogleIcon width="40" height="40" viewBox="0 0 40 40" /></a>
					<a href="#" id="linkedin" onClick={handleOAuthServiceClick}><LinkedInIcon width="40" height="40" viewBox="0 0 40 40" /></a>
					<a href="#" id="twitter" onClick={handleOAuthServiceClick}><TwitterIcon width="40" height="40" viewBox="0 0 40 40" /></a>
					<a href="#" id="github" onClick={handleOAuthServiceClick}><GitHub /></a>
				</div>
				<Typography variant="h4" className={styles.smallTextBlock}>If you don’t have an account, a new one will be created for you.</Typography>
			</div>
		</div>
	);
};

export default AccountMenu;