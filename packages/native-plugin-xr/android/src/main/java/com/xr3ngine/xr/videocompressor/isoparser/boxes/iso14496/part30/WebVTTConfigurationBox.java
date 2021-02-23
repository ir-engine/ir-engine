package com.xr3ngine.xr.videocompressor.isoparser.boxes.iso14496.part30;

import com.xr3ngine.xr.videocompressor.isoparser.support.AbstractBox;
import com.xr3ngine.xr.videocompressor.isoparser.tools.IsoTypeReader;
import com.xr3ngine.xr.videocompressor.isoparser.tools.Utf8;

import java.nio.ByteBuffer;

/**
 * Created by sannies on 04.12.2014.
 */
public class WebVTTConfigurationBox extends AbstractBox {
    public static final String TYPE = "vttC";

    String config = "";

    public WebVTTConfigurationBox() {
        super(TYPE);
    }

    @Override
    protected long getContentSize() {
        return Utf8.utf8StringLengthInBytes(config);
    }

    @Override
    protected void getContent(ByteBuffer byteBuffer) {
        byteBuffer.put(Utf8.convert(config));
    }

    @Override
    protected void _parseDetails(ByteBuffer content) {
        config = IsoTypeReader.readString(content, content.remaining());
    }

    public String getConfig() {
        return config;
    }

    public void setConfig(String config) {
        this.config = config;
    }
}
