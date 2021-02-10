import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@material-ui/core';
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import styles from '../style.module.scss';
import { LazyImage } from '../../LazyImage';
import { getAvatarURL, SettingMenuProps } from '../util';

const AvatarMenu = (props: any): any => {
	const MAX_AVATARS_PER_PAGE = 6;
	const MIN_AVATARS_PER_PAGE = 4;

	const getAvatarPerPage = () => window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE;

	const [ page, setPage ] = useState(0);
	const [ imgPerPage, setImgPerPage ] = useState(getAvatarPerPage());

	useEffect(() => {
		function handleResize() {
			setImgPerPage(getAvatarPerPage());
		}

		window.addEventListener('resize', handleResize);

		return _ => {
			window.removeEventListener('resize', handleResize)
		};
	});

	const renderAvatarList = () => {
		const avatarList = [];
		const startIndex = page * imgPerPage;
		const endIndex = Math.min(startIndex + imgPerPage, CharacterAvatars.length);

		for (let i = startIndex; i < endIndex; i++) {
			const characterAvatar = CharacterAvatars[i];
			avatarList.push(
				<Card key={characterAvatar.id} className={styles.avatarPreviewWrapper}>
					<CardContent onClick={() => props.setAvatar(characterAvatar.id)}>
						<LazyImage
							key={characterAvatar.id}
							src={getAvatarURL(characterAvatar.id)}
							alt={characterAvatar.title}
						/>
					</CardContent>
				</Card>
			)
		}

		return avatarList;
	}
	return (
		<div className={styles.avatarPanel}>
			<section className={styles.avatarCountainer}>
				{renderAvatarList()}
			</section>
		</div>
	);
};

export default AvatarMenu;