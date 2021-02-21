package com.xr3ngine.xr.videocompressor.isoparser.boxes.sampleentry;

import com.xr3ngine.xr.videocompressor.isoparser.Container;
import com.xr3ngine.xr.videocompressor.isoparser.ParsableBox;

/**
 * Created by sannies on 30.05.13.
 */
public interface SampleEntry extends ParsableBox, Container {
    int getDataReferenceIndex();

    void setDataReferenceIndex(int dataReferenceIndex);
}
