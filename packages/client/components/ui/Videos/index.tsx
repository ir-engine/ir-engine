// import NavItem from '../NavItem'
import React, { useEffect } from 'react';
// import Link from 'next/link';

// import { siteTitle } from '../../../config/server'

import './style.scss';
import Button from '@material-ui/core/Button';
import { connect } from 'react-redux';
import { selectVideoState } from '../../../redux/video/selector';
import { bindActionCreators, Dispatch } from 'redux';
import { fetchPublicVideos } from '../../../redux/video/service';
import { PublicVideo } from '../../../redux/video/actions';

const mapStateToProps = (state: any): any => {
  return {
    videos: selectVideoState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchPublicVideos: bindActionCreators(fetchPublicVideos, dispatch)
});

interface Props {
  videos: any;
  fetchPublicVideos: typeof fetchPublicVideos;
}

export const VideoList = (props: Props): any => {
  const { videos, fetchPublicVideos } = props;
  useEffect(() => {
    fetchPublicVideos();
  }, []);
  return (
    <div>
      <Button variant="contained" color="primary" className={'back'} href="/">
        Back
      </Button>
      <div className="video-container">
        {videos.get('videos').map((video: PublicVideo, i: number) => {
          return (
            <div className="box" key={i}>
              {/* <Link
                href={
                  '/video?manifest=' + video.url + '&title=' + video.name
                }
              >
              </Link> */}
                {video.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoList);
