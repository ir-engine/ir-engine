import React from 'react';
import { Typography, InputAdornment, TextField } from '@material-ui/core';
import { Send, ArrowBack, GitHub } from '@material-ui/icons';
import { FacebookIcon } from '../../Icons/FacebookIcon';
import { GoogleIcon } from '../../Icons/GoogleIcon';
import { LinkedInIcon } from '../../Icons/LinkedInIcon';
import { TwitterIcon } from '../../Icons/TwitterIcon';
import styles from '../style.module.scss';

const AccountMenu = (props: any): any => {
	return (
		<div className={styles.menuPanel}>
			<div className={styles.accountPanel}>
				<Typography variant="h1" className={styles.panelHeader}>
					<span className={styles.materialIconBlock}>					
						<ArrowBack onClick={props.closeMenu} />
					</span>
					Connect your email or phone number
				</Typography>

				<TextField
					className={styles.emailField}
					size="small"
					placeholder="Phone Number / Email"
					variant="outlined"
					InputProps={{
						endAdornment: (
							<InputAdornment position="end" onClick={() => {console.log('Sending Message...')}}>
								<Send />
							</InputAdornment>
						),
					}}
				/>

				<Typography variant="h3" className={styles.textBlock}>Or connect with one of your accounts</Typography>
				<div className={styles.socialContainer}>
					<FacebookIcon width="40" height="40" viewBox="0 0 40 40" onClick={() => {console.log('Connecting with Facebook...')}} />
					<GoogleIcon width="40" height="40" viewBox="0 0 40 40" onClick={() => {console.log('Connecting with Google...')}} />
					<LinkedInIcon width="40" height="40" viewBox="0 0 40 40" onClick={() => {console.log('Connecting with Linkedin...')}} />
					<TwitterIcon width="40" height="40" viewBox="0 0 40 40" onClick={() => {console.log('Connecting with Twitter...')}} />
					<GitHub onClick={() => {console.log('Connecting with Github...')}} />
				</div>
				<Typography variant="h4" className={styles.smallTextBlock}>If you don’t have an account, a new one will be created for you.</Typography>
			</div>
		</div>
	);
};

export default AccountMenu;