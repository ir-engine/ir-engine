package com.xrengine.xr;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.hardware.display.VirtualDisplay;
import android.media.MediaRecorder;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.Build;
import android.os.Bundle;
import android.os.IBinder;
import android.util.Log;
import android.widget.ToggleButton;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/*
Created to request screen recording permssions using MediaProjection
* */
public class MediaProjectionHelperService extends Service
{

    private MediaProjectionManager mProjectionManager;
    private MediaProjection mMediaProjection;
    private VirtualDisplay mVirtualDisplay;
    //private MainActivity.MediaProjectionCallback mMediaProjectionCallback;
    private ToggleButton mToggleButton;
    private MediaRecorder mMediaRecorder;

    @Override
    public void onCreate()
    {
        super.onCreate();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId)
    {

        Intent notificationIntent = new Intent(this, BlankActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(this,
                0, notificationIntent, 0);

        NotificationManager mNotificationManager = (NotificationManager) getApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        NotificationChannel mChannel=null;
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
        {
            mChannel = new NotificationChannel("asdf", "default", NotificationManager.IMPORTANCE_NONE);

            mChannel.setLightColor(Color.GRAY);
            mChannel.enableLights(true);
            mChannel.setDescription("desc");
            mNotificationManager.createNotificationChannel(mChannel);
        }





        Notification notification = new NotificationCompat.Builder(this, "asdf")
                .setContentTitle("Example Service")
                .setContentText("asfd")
                .setSmallIcon(R.drawable.ic_launcher)
                .setContentIntent(pendingIntent)
                .build();
        startForeground(1, notification);

       /* mMediaRecorder = new MediaRecorder();

        mProjectionManager = (MediaProjectionManager) getSystemService
                (Context.MEDIA_PROJECTION_SERVICE);
*/
        openBlankActivity();

        return START_NOT_STICKY;
    }

    private void openBlankActivity() {
        Intent mainIntent = new Intent(getApplicationContext(), BlankActivity.class);
        mainIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        startActivity(mainIntent);
    }

    @Override
    public void onDestroy()
    {
        super.onDestroy();
        Log.d("TempSerive","Service stopped succesuflly");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent)
    {
        return null;
    }
}
