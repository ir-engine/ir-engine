import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@material-ui/core';
import { NavigateNext, NavigateBefore, Check, ArrowBack } from '@material-ui/icons';
import { CharacterAvatars } from '@xr3ngine/engine/src/templates/character/CharacterAvatars';
import styles from '../style.module.scss';
import { LazyImage } from '../../LazyImage';
import { getAvatarURL, SettingMenuProps, Views } from '../util';

const AvatarMenu = (props: any): any => {
	const MAX_AVATARS_PER_PAGE = 6;
	const MIN_AVATARS_PER_PAGE = 4;

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

	const loadNextAvatars = (e) => {
		e.preventDefault();
		if ((page + 1) * imgPerPage >= CharacterAvatars.length) return;
		setPage(page + 1);
	}
	const loadPreviousAvatars = (e) => {
		e.preventDefault();
		if (page === 0) return;
		setPage(page - 1);
	}

	const selectAvatar = (e) => {
		const selectedAvatar = e.currentTarget.id
		setSelectedAvatarId(selectedAvatar);
		if (props.avatarId !== selectedAvatar) {
			props.setAvatar(selectedAvatar);
		}
	}

	const closeMenu = (e) => {
		e.preventDefault();
		props.changeActiveMenu(null);
	}

	const openProfileMenu = (e) => {
		e.preventDefault();
		props.changeActiveMenu(Views.Profile);
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
				<a href="#" className={`${styles.iconBlock} ${page === 0 ? styles.disabled : ''}`} onClick={loadPreviousAvatars}>
					<NavigateBefore />
				</a>
				<div className={styles.actionBlock}>
					<a href="#" className={styles.iconBlock} onClick={openProfileMenu}>
						<ArrowBack />
					</a>
					<a href="#" className={styles.iconBlock} onClick={closeMenu}>
						<Check />
					</a>
				</div>
				<a href="#" className={`${styles.iconBlock} ${(page + 1) * imgPerPage >= CharacterAvatars.length ? styles.disabled : ''}`} onClick={loadNextAvatars}>
					<NavigateNext />
				</a>
			</section>
		</div>
	);
};

export default AvatarMenu;