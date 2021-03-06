package com.xr3ngine.xr;

import android.app.Activity;
import android.content.Intent;
import android.media.projection.MediaProjectionManager;
import android.os.Bundle;

import static com.xr3ngine.xr.MediaProjectionHelper.mediaProjectionManager;
import static com.xr3ngine.xr.MediaProjectionHelper.mediaProjection;
import static com.xr3ngine.xr.MediaProjectionHelper.resultCode;
import static com.xr3ngine.xr.MediaProjectionHelper.data;

public class BlankActivity extends Activity
{

    @Override
    protected void onCreate(final Bundle savedInstanceState) {
        super.onCreate(null);
        mediaProjectionManager = (MediaProjectionManager)getSystemService(MEDIA_PROJECTION_SERVICE);
        startActivityForResult(mediaProjectionManager.createScreenCaptureIntent(), 1);
    }


    @Override
    public void onActivityResult(int requestCode, int resCode, Intent intentdata)
    {
        if (requestCode == 1)
        {
            if (resCode == Activity.RESULT_OK)
            {
                mediaProjection = mediaProjectionManager.getMediaProjection(resCode, intentdata);
                resultCode = resCode;
                data = intentdata;
                this.finish();
            }
        }
    }
}
