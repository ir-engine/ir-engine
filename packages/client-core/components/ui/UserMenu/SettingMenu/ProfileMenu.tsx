import React, { useState } from 'react';
import { TextField, Button } from '@material-ui/core';
import CreateIcon from '@material-ui/icons/Create';
import CheckIcon from '@material-ui/icons/Check';
import styles from '../style.module.scss';
import { getAvatarURL } from '../util';

const ProfileMenu = (props: any): any => {
	const [isEditUsername, setEditUsername] = useState(false);
	const toggleUserEdit = () => {
		setEditUsername(!isEditUsername);
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
									value={props.user?.name || ''}
									onChange={props.setUsername}
								/>
								<span className={styles.materialIconBlock}>					
									<CheckIcon className={styles.primaryForeground} onClick={toggleUserEdit} />
								</span>
							</>
						) : (
							<>
								<h1>{props.user?.name}</h1>
								<span className={styles.materialIconBlock}>					
									<CreateIcon className={styles.primaryForeground} onClick={toggleUserEdit} />
								</span>
							</>
						)}
				</div>
				<div className={styles.avatarBlock}>
					<div className={styles.avatarImg}>
						<img src={getAvatarURL(props.user.avatarId)} />
					</div>
					<Button className={styles.avatarBtn} onClick={props.openAvatarMenu}>Change Avatar</Button>
				</div>
				<div className={styles.accountBlock}>
					<h2>You are a <span>{props.user.userRole}</span>.</h2>
					<Button className={styles.createAccountBtn}>Create Account</Button>
				</div>
			</section>
		</div>
	);
};

export default ProfileMenu;