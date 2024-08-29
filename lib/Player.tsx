import React, { useState } from 'react';

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
  MediaFullscreenButton,
} from 'media-chrome/dist/react';
import { createComponent } from '@lit/react';
import { TimedTextPlayer } from '../../timedtext-player/dist/timedtext-player.js'; // FIXME
// import { TimedTextPlayer } from '@theirstoryinc/timedtext-player/dist/timedtext-player.js';

export const TimedTextPlayerComponent = createComponent({
  tagName: 'timedtext-player',
  elementClass: TimedTextPlayer,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});

// TODO player props
// incl skip MediaController
export const Player = ({
  transcript,
  poster,
  // width = 620,
  // height = 360,
  pauseMutationObserver = false,
}: {
  transcript: string;
  poster: string | undefined;
  // width?: number | undefined;
  // height?: number | undefined;
  pauseMutationObserver: boolean;
}) => {
  return (
    <>
      <MediaController id="myController" style={{ width: '100%', height: '100%' }}>
        <MediaControlBar style={{ width: '100%' }}>
          <MediaPlayButton></MediaPlayButton>
          <MediaMuteButton></MediaMuteButton>
          <MediaVolumeRange></MediaVolumeRange>
          <MediaTimeDisplay></MediaTimeDisplay>
          <MediaTimeRange></MediaTimeRange>
          <MediaDurationDisplay></MediaDurationDisplay>
          <MediaCaptionsButton></MediaCaptionsButton>
          <MediaFullscreenButton></MediaFullscreenButton>
        </MediaControlBar>

        <TimedTextPlayerComponent
          slot="media"
          pause-mutation-observer={pauseMutationObserver}
          // width={width}
          // height={height}
          poster={poster}
          transcript={transcript}
          player="#video1" // FIXME
        ></TimedTextPlayerComponent>
      </MediaController>
    </>
  );
};
