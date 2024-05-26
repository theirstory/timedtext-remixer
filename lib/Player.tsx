import React, { useState, useReducer, useCallback } from "react";

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaDurationDisplay,
  MediaCaptionsButton,
  MediaMuteButton,
} from "media-chrome/dist/react";
import { createComponent } from "@lit/react";
import { TimedTextPlayer } from "../../timedtext-player/dist/timedtext-player.js";

export const TimedTextPlayerComponent = createComponent({
  tagName: "timedtext-player",
  elementClass: TimedTextPlayer,
  react: React,
  events: {
    onactivate: "activate",
    onchange: "change",
  },
});

export const Player = () => {
  //
  return (
    <MediaController id="myController">
      <MediaControlBar style={{ width: "100%" }}>
        <MediaPlayButton></MediaPlayButton>
        <MediaMuteButton></MediaMuteButton>
        <MediaVolumeRange></MediaVolumeRange>
        <MediaTimeDisplay></MediaTimeDisplay>
        <MediaTimeRange></MediaTimeRange>
        <MediaDurationDisplay></MediaDurationDisplay>
        <MediaCaptionsButton></MediaCaptionsButton>
      </MediaControlBar>

      <TimedTextPlayerComponent
        slot="media"
        width={width}
        height={height}
        // transcript="#transcript"
        player="#video1"
      ></TimedTextPlayerComponent>
    </MediaController>
  );
};
