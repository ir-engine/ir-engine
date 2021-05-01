/*
 * Copyright (C) 2015 Yuya Tanaka
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.xrengine.xr.transcoder.engine;

import android.media.MediaFormat;
import android.text.TextUtils;

import com.xrengine.xr.transcoder.format.MediaFormatExtraConstants;

class MediaFormatValidator {

    public static void validateVideoOutputFormat(MediaFormat format) {
        String mime = format.getString(MediaFormat.KEY_MIME);
        // Refer: http://developer.android.com/guide/appendix/media-formats.html#core
        // Refer: http://en.wikipedia.org/wiki/MPEG-4_Part_14#Data_streams
        if (!MediaFormatExtraConstants.MIMETYPE_VIDEO_AVC.equals(mime) &&
        !MediaFormatExtraConstants.MIMETYPE_VIDEO_MP4V_ES.equals(mime)) {
            throw new InvalidOutputFormatException("Video codec other than AVC or MP4V is not supported, actual mime type: " + mime);
        }
    }

    public static void validateAudioOutputFormat(MediaFormat format) {
        String mime = format.getString(MediaFormat.KEY_MIME);
        if (!MediaFormatExtraConstants.MIMETYPE_AUDIO_AAC.equals(mime) &&
        !MediaFormatExtraConstants.MIMETYPE_AUDIO_3GPP.equals(mime)) {
            throw new InvalidOutputFormatException("Audio codec other than AAC or 3GPP is not supported, actual mime type: " + mime);
        }
    }
}
