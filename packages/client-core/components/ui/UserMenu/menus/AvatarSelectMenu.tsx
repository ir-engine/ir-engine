import React from 'react';
import * as THREE from 'three';
import { ArrowBack, CloudUpload, SystemUpdateAlt, Help, MouseOutlined } from '@material-ui/icons';
import IconLeftClick from '../../Icons/IconLeftClick';
import { getLoader } from '@xr3ngine/engine/src/assets/functions/LoadGLTF';
import { getOrbitControls } from '@xr3ngine/engine/src/input/functions/loadOrbitControl';
import { Views } from '../util';
//@ts-ignore
import styles from '../style.module.scss';

const THUMBNAIL_WIDTH = 300;
const THUMBNAIL_HEIGHT = 300;

interface Props {
    changeActiveMenu: Function;
	uploadAvatarModel: Function;
}

interface State {
    selectedFile: any;
    imgFile: any;
}

export default class AvatarSelectMenu extends React.Component<Props, State> {
	camera = null;
	scene = null;
	renderer = null;
	fileSelected = false;

	constructor(props) {
		super(props);

		this.state = {
			selectedFile: null,
			imgFile: null,
		}
	}

	componentDidMount() {
		const container = document.getElementById('stage');
		const bounds = container.getBoundingClientRect();

		this.camera = new THREE.PerspectiveCamera(45, bounds.width / bounds.height, 0.25, 20);
		this.camera.position.set(0, 1.25, 1.25);

		this.scene = new THREE.Scene();

		this.scene.background = new THREE.Color(0xc8c8c8);
		this.scene.add(new THREE.AmbientLight(0xc8c8c8));

		this.renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(bounds.width, bounds.height);
		this.renderer.outputEncoding = THREE.sRGBEncoding;
		this.renderer.domElement.id = 'avatarCanvas';
		container.appendChild(this.renderer.domElement);

		const controls = getOrbitControls(this.camera, this.renderer.domElement);
		(controls as any).addEventListener('change', this.renderScene); // use if there is no animation loop
		controls.minDistance = 0.1;
		controls.maxDistance = 10;
		controls.target.set(0, 1.25, 0);
		controls.update();

		window.addEventListener('resize', this.onWindowResize);
	}

	componentWillUnmount() {
		window.removeEventListener('resize', this.onWindowResize);
	}

	onWindowResize = () => {
	    const container = document.getElementById('stage');
	    const bounds = container.getBoundingClientRect();
	    this.camera.aspect = bounds.width / bounds.height;
	    this.camera.updateProjectionMatrix();

	    this.renderer.setSize(bounds.width, bounds.height);

	    this.renderScene();
	}

	renderScene = () => {
	    this.renderer.render(this.scene, this.camera);
	}

	handleBrowse = () => {
	    document.getElementById('avatarSelect').click();
	}

	handleAvatarChange = (e) => {
	    this.scene.children = this.scene.children.filter(c => c.name !== 'avatar');
	    const file = e.target.files[ 0 ];
	    const reader = new FileReader();
	    reader.onload = gltfText => {
	        const loader = getLoader();
	        loader.parse(gltfText.target.result, '', gltf => {
	            gltf.scene.name = 'avatar'
	            this.scene.add( gltf.scene );
	            this.renderScene();
	        }, errormsg => console.error( errormsg ));
	    };

	    reader.readAsArrayBuffer( file );
	    this.fileSelected = true;
	    this.setState({ selectedFile: e.target.files[0] });
	}

	openAvatarMenu = (e) => {
		e.preventDefault();
		this.props.changeActiveMenu(Views.Avatar);
	}

	uploadAvatar = () => {
	    const canvas = document.createElement('canvas');
	    canvas.width = THUMBNAIL_WIDTH,
	    canvas.height = THUMBNAIL_HEIGHT;
	    const newContext = canvas.getContext('2d');
	    newContext.drawImage(this.renderer.domElement, 0, 0);

	    canvas.toBlob(blob => {
			this.props.uploadAvatarModel(this.state.selectedFile, blob);
	    });
	}

	render() {
		return (
			<div className={styles.avatarUploadPanel}>
            	<div className={styles.avatarHeaderBlock}>
            		<button type="button" className={styles.iconBlock} onClick={this.openAvatarMenu}>
						<ArrowBack />
					</button>
	                <h2>Upload Avatar</h2>
	            </div>
                <div id="stage" className={styles.stage} style={{width: THUMBNAIL_WIDTH + 'px', height: THUMBNAIL_HEIGHT + 'px'}}>
                	<div className={styles.legendContainer}>
                		<Help />
                		<div className={styles.legend}>
                			<div><IconLeftClick /> - <span>Rotate</span></div>
                			<div><span className={styles.shiftKey}>Shift</span> + <IconLeftClick /> - <span>Pan</span></div>
                		</div>
                	</div>
                </div>
                <div className={styles.avatarSelectLabel}>{this.fileSelected ? this.state.selectedFile.name : 'Select Avatar...'}</div>
            	<input type="file" id="avatarSelect" accept=".glb, .gltf" hidden onChange={this.handleAvatarChange} />
            	<div className={styles.controlContainer}>
	                <button type="button" className={styles.browseBtn} onClick={this.handleBrowse}>Browse <SystemUpdateAlt /></button>
	                <button type="button" className={styles.uploadBtn} onClick={this.uploadAvatar} disabled={!this.fileSelected}>Upload <CloudUpload /></button>
	            </div>
		    </div>
		)
	}
}