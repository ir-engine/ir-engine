package com.xr3ngine.xr.videocompressor.isoparser.boxes.iso14496.part30;

import com.xr3ngine.xr.videocompressor.isoparser.BoxParser;
import com.xr3ngine.xr.videocompressor.isoparser.boxes.sampleentry.AbstractSampleEntry;
import com.xr3ngine.xr.videocompressor.isoparser.tools.Path;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.ReadableByteChannel;
import java.nio.channels.WritableByteChannel;

/**
 * Sample Entry for WebVTT subtitles.
 * <pre>
 * class WVTTSampleEntry() extends PlainTextSampleEntry (‘wvtt’){
 *   WebVTTConfigurationBox config;
 *   WebVTTSourceLabelBox label; // recommended
 *   MPEG4BitRateBox (); // optional
 * }
 * </pre>
 */
public class WebVTTSampleEntry extends AbstractSampleEntry {
    public static final String TYPE = "wvtt";

    public WebVTTSampleEntry() {
        super(TYPE);
    }

    @Override
    public void parse(ReadableByteChannel dataSource, ByteBuffer header, long contentSize, BoxParser boxParser) throws IOException {
        initContainer(dataSource, contentSize, boxParser);
    }

    @Override
    public void getBox(WritableByteChannel writableByteChannel) throws IOException {
        writableByteChannel.write(getHeader());
        writeContainer(writableByteChannel);
    }

    public WebVTTConfigurationBox getConfig() {
        return Path.getPath(this, "vttC");
    }

    public WebVTTSourceLabelBox getSourceLabel() {
        return Path.getPath(this, "vlab");
    }
}
