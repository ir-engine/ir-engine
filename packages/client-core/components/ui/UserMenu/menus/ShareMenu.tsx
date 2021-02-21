import React, { useRef } from 'react';
import { Typography, InputAdornment, TextField, Button } from '@material-ui/core';
import { Send, FileCopy } from '@material-ui/icons';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
import styles from '../style.module.scss';

const ShareMenu = (props: any): any => {
	const refLink = useRef(null);
	const postTitle = 'AR/VR world';
  	const siteTitle = 'XR3ngine';

	const copyLinkToClipboard = () => {
		refLink.current.select();
		document.execCommand("copy");
		refLink.current.setSelectionRange(0, 0); // deselect
		props.alertSuccess('Link copied to clipboard.');
	};

	const shareOnApps = () => {
	    if (!navigator.share) return;
      	navigator
	        .share({
	          title: `${postTitle} | ${siteTitle}`,
	          text: `Check out ${postTitle} on ${siteTitle}`,
	          url: document.location.href,
	        })
	        .then(() => { console.log('Successfully shared'); })
	        .catch(error => { console.error('Something went wrong sharing the world', error); });
	};

	return (
		<div className={styles.menuPanel}>
			<div className={styles.sharePanel}>
				<Typography variant="h1" className={styles.panelHeader}>Location URL</Typography>
				<textarea readOnly className={styles.shareLink} ref={refLink} value={window.location.href} />
				<Button onClick={copyLinkToClipboard} className={styles.copyBtn}>
					Copy
					<span className={styles.materialIconBlock}>					
						<FileCopy />
					</span>
				</Button>

				<Typography variant="h2">Send to email or phone number</Typography>
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
				{(isMobileOrTablet() && navigator.share)
					? <div className={styles.shareBtnContainer}><Button className={styles.shareBtn} onClick={shareOnApps}>Share</Button></div>
					: null}
			</div>
		</div>
	);
};

export default ShareMenu;