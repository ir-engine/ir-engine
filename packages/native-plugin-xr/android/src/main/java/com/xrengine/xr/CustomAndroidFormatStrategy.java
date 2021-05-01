package org.apache.cordova.videoeditor;

import android.media.MediaCodecInfo;
import android.media.MediaFormat;
import android.util.Log;
import com.xrengine.xr.transcoder.format.MediaFormatStrategy;
import com.xrengine.xr.transcoder.format.OutputFormatUnavailableException;

/**
 * Created by ehmm on 02.05.2016.
 *
 *
 */
public class CustomAndroidFormatStrategy implements MediaFormatStrategy {

    private static final String TAG = "CustomFormatStrategy";
    private static final int DEFAULT_BITRATE = 500000;
    private static final int DEFAULT_FRAMERATE = 30;
    private static final int DEFAULT_WIDTH = 0;
    private static final int DEFAULT_HEIGHT = 0;
    private final int mBitRate;
    private final int mFrameRate;
    private final int width;
    private final int height;

    public CustomAndroidFormatStrategy() {
        this.mBitRate = DEFAULT_BITRATE;
        this.mFrameRate = DEFAULT_FRAMERATE;
        this.width = DEFAULT_WIDTH;
        this.height = DEFAULT_HEIGHT;
    }

    public CustomAndroidFormatStrategy(final int bitRate, final int frameRate, final int width, final int height) {
        this.mBitRate = bitRate;
        this.mFrameRate = frameRate;
        this.width = width;
        this.height = height;
    }

    public MediaFormat createVideoOutputFormat(MediaFormat inputFormat) {
        int inWidth = inputFormat.getInteger(MediaFormat.KEY_WIDTH);
        int inHeight = inputFormat.getInteger(MediaFormat.KEY_HEIGHT);
        int inLonger, inShorter, outWidth, outHeight, outLonger;

        outWidth = this.width;
        outHeight = this.height;

        MediaFormat format = MediaFormat.createVideoFormat("video/avc", 480, 360);
        format.setInteger(MediaFormat.KEY_BIT_RATE, mBitRate);
        format.setInteger(MediaFormat.KEY_FRAME_RATE, mFrameRate);
        format.setInteger(MediaFormat.KEY_I_FRAME_INTERVAL, 3);
        format.setInteger(MediaFormat.KEY_COLOR_FORMAT, MediaCodecInfo.CodecCapabilities.COLOR_FormatSurface);

        return format;

    }

    public MediaFormat createAudioOutputFormat(MediaFormat inputFormat) {
        return null;
    }

}
