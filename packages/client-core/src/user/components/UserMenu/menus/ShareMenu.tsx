import React, { useRef } from 'react';
import Typography from '@material-ui/core/Typography';
import InputAdornment from '@material-ui/core/InputAdornment';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { Send, FileCopy } from '@material-ui/icons';
import { isMobileOrTablet } from '@xr3ngine/engine/src/common/functions/isMobile';
//@ts-ignore
// @ts-ignore
import styles from '../UserMenu.module.scss';
import { sendInvite } from '../../../../social/reducers/invite/service';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import { selectInviteState } from '../../../../social/reducers/invite/selector';

const mapDispatchToProps = (dispatch: Dispatch): any => ({
	sendInvite: bindActionCreators(sendInvite, dispatch)
});

const mapStateToProps = ( state: any): any => {
	return {
		inviteState: selectInviteState(state)
	};
};

interface Props {
	sendInvite?: typeof sendInvite;
	alertSuccess?: any;
	inviteState?: any
}

const ShareMenu = (props: Props): any => {
	const { sendInvite, inviteState } = props;
	const [email, setEmail] = React.useState("");
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


	const packageInvite = async (): Promise<void> => {
	   const sendData = {
		   type: "friend",
		   token: email,
		   inviteCode: null,
		   identityProviderType: "email",
		   targetObjectId: inviteState.get("targetObjectId"),
		   invitee: null
	   };
	   sendInvite(sendData);
	   setEmail("");
	};

	const handleChang  = (e) => {
		setEmail(e.target.value);
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

				<Typography variant="h5">Send to email or phone number</Typography>
				<TextField
					className={styles.emailField}
					size="small"
					placeholder="Phone Number / Email"
					variant="outlined"
					value={email}
					onChange={(e)=> handleChang(e) }
					InputProps={{
						endAdornment: (
							<InputAdornment position="end" onClick={() => packageInvite()}>
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

export default connect(mapStateToProps, mapDispatchToProps)(ShareMenu);