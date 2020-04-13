// import NavItem from '../NavItem'
import React, { Component } from 'react'

// import { siteTitle } from '../../../config/server'

import './style.scss'
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux'
import { selectVideoState } from "../../../redux/video/selector";
import { bindActionCreators, Dispatch } from "redux";
import { fetchPulicVideos } from "../../../redux/video/service";
import { PublicVideo } from "../../../redux/video/actions";
// TODO: Generate nav items from a config file


interface VideoProps {
    videos: any,
    fetchPublicVideos: typeof fetchPulicVideos
}


const mapStateToProps = (state: any) => {
    return {
        videos: selectVideoState(state)
    }
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    fetchPublicVideos: bindActionCreators(fetchPulicVideos, dispatch)
});

class VideoList extends Component<VideoProps> {
    render() {
        let { videos } = this.props;

        return (
            <div>
                <Button
                    variant="contained"
                    color="primary"
                    className={'back'}
                    href="/"
                >
                    Back
                </Button>
                <div className="video-container">
                    {videos.get('videos').map(function (video: PublicVideo, i: number) {
                            return (
                                <div className="box"
                                     key={i}>
                                    <a href={video.link}
                                    >{video.title}</a>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        )
    }

    componentDidMount() {
        this.props.fetchPublicVideos()
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(VideoList);
