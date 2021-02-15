import React, { useState } from 'react';
import { TextField, Button } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import CheckIcon from '@material-ui/icons/Check';
import styles from '../style.module.scss';
import { getAvatarURL, Views } from '../util';

const ProfileMenu = (props: any): any => {
	const [isEditUsername, setEditUsername] = useState(false);
	const toggleUserEdit = (e) => {
		e.preventDefault();
		if (isEditUsername) props.updateUsername();
		setEditUsername(!isEditUsername);
	}

	const handleUsernameChange = (e) => {
		props.setUsername(e.target.value);
	}

	return (
		<div className={styles.menuPanel}>
			<section className={styles.profilePanel}>
				<div className={styles.headerBlock}>
					{isEditUsername
						? (
							<>
								<TextField
									margin="none"
									size="small"
									required
									fullWidth
									placeholder="Username"
									name="username"
									autoFocus
									value={props.username || ''}
									onChange={handleUsernameChange}
									onKeyDown={(e) => { if (e.key === 'Enter') toggleUserEdit(e); }}
								/>
								<a href="#" className={styles.materialIconBlock} onClick={toggleUserEdit}>
									<CheckIcon className={styles.primaryForeground} />
								</a>
							</>
						) : (
							<>
								<h1>{props.username}</h1>
								<a href="#" className={styles.materialIconBlock} onClick={toggleUserEdit}>					
									<CreateIcon className={styles.primaryForeground} />
								</a>
							</>
						)}
				</div>
				<div className={styles.avatarBlock}>
					<div className={styles.avatarImg}>
						<img src={getAvatarURL(props.avatarId)} />
					</div>
					<Button className={styles.avatarBtn} onClick={() => props.changeActiveMenu(Views.Avatar)}>Change Avatar</Button>
				</div>
				<div className={styles.accountBlock}>
					<h2>You are a <span>{props.userRole}</span>.</h2>
					<Button className={styles.createAccountBtn} onClick={() => props.changeActiveMenu(Views.Account)}>Connect Account</Button>
				</div>
			</section>
		</div>
	);
};

export default ProfileMenu;