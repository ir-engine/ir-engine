package com.xr3ngine.xr.videocompressor.isoparser.boxes.apple;

import com.xr3ngine.xr.videocompressor.isoparser.support.AbstractContainerBox;

/**
 * <h1>4cc = "{@value #TYPE}"</h1>
 * Don't know what it is but it is obviously a container box.
 */
public class TrackApertureModeDimensionAtom extends AbstractContainerBox {
    public static final String TYPE = "tapt";

    public TrackApertureModeDimensionAtom() {
        super(TYPE);
    }


}
