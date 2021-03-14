/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.xr3ngine.xr.arcore.helpers;

import android.app.Activity;
import android.view.WindowManager;

import com.google.ar.core.Camera;
import com.google.ar.core.TrackingFailureReason;
import com.google.ar.core.TrackingState;

/** Gets human readibly tracking failure reasons and suggested actions. */
public final class TrackingStateHelper {

  private final Activity activity;

  private TrackingState previousTrackingState;

  public TrackingStateHelper(Activity activity) {
    this.activity = activity;
  }

  /** Keep the screen unlocked while tracking, but allow it to lock when tracking stops. */
  public void updateKeepScreenOnFlag(TrackingState trackingState) {
    if (trackingState == previousTrackingState) {
      return;
    }

    previousTrackingState = trackingState;
    switch (trackingState) {
      case PAUSED:
      case STOPPED:
        activity.runOnUiThread(
            () -> activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
        break;
      case TRACKING:
        activity.runOnUiThread(
            () -> activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON));
        break;
    }
  }

}
