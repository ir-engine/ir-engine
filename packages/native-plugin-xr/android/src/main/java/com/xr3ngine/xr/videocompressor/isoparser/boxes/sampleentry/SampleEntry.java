package com.xrengine.xr.videocompressor.isoparser.boxes.sampleentry;

import com.xrengine.xr.videocompressor.isoparser.Container;
import com.xrengine.xr.videocompressor.isoparser.ParsableBox;

/**
 * Created by sannies on 30.05.13.
 */
public interface SampleEntry extends ParsableBox, Container {
    int getDataReferenceIndex();

    void setDataReferenceIndex(int dataReferenceIndex);
}
