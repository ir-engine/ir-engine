import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@material-ui/core';
import { NavigateNext, NavigateBefore, Check, ArrowBack } from '@material-ui/icons';
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import styles from '../style.module.scss';
import { LazyImage } from '../../LazyImage';
import { getAvatarURL, SettingMenuProps } from '../util';

const AvatarMenu = (props: any): any => {
	const MAX_AVATARS_PER_PAGE = 6;
	const MIN_AVATARS_PER_PAGE = 5;

	const getAvatarPerPage = () => window.innerWidth > 768 ? MAX_AVATARS_PER_PAGE : MIN_AVATARS_PER_PAGE;

	const [ page, setPage ] = useState(0);
	const [ imgPerPage, setImgPerPage ] = useState(getAvatarPerPage());
	const [ selectedAvatarId, setSelectedAvatarId ] = useState(''); 

	useEffect((() => {
		function handleResize() {
			setImgPerPage(getAvatarPerPage());
		}

		window.addEventListener('resize', handleResize);

		return _ => {
			window.removeEventListener('resize', handleResize)
		};
	}) as any);

	const loadNextAvatars = () => {
		if ((page + 1) * imgPerPage >= CharacterAvatars.length) return;
		setPage(page + 1);
	}
	const loadPreviousAvatars = () => {
		if (page === 0) return;
		setPage(page - 1);
	}

	const handleAvatarChange = () => {
		if (props.avatarId !== selectedAvatarId) {
			props.setAvatar(selectedAvatarId);
		}
	}

	const selectAvatar = (e) => {
		setSelectedAvatarId(e.currentTarget.id);
	}


	const renderAvatarList = () => {
		const avatarList = [];
		const startIndex = page * imgPerPage;
		const endIndex = Math.min(startIndex + imgPerPage, CharacterAvatars.length);

		for (let i = startIndex; i < endIndex; i++) {
			const characterAvatar = CharacterAvatars[i];
			avatarList.push(
				<Card
					key={characterAvatar.id}
					className={`
						${styles.avatarPreviewWrapper}
						${characterAvatar.id === props.avatarId ? styles.activeAvatar : ''}
						${characterAvatar.id === selectedAvatarId ? styles.selectedAvatar : ''}
					`}>
					<CardContent id={characterAvatar.id} onClick={selectAvatar}>
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
			<section className={styles.avatarContainer}>
				{renderAvatarList()}
			</section>
			<section className={styles.controlContainer}>
				<span className={styles.iconBlock} onClick={loadPreviousAvatars}>
					<NavigateBefore />
				</span>
				<div className={styles.actionBlock}>
					<span className={styles.iconBlock} onClick={props.closeMenu}>
						<ArrowBack />
					</span>
					<span className={styles.iconBlock} onClick={handleAvatarChange}>
						<Check />
					</span>
				</div>
				<span className={styles.iconBlock} onClick={loadNextAvatars}>
					<NavigateNext />
				</span>
			</section>
		</div>
	);
};

export default AvatarMenu;