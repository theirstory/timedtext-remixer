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
  width = 620,
  height = 360,
  pauseMutationObserver = false,
}: {
  transcript: string;
  poster: string | undefined;
  width?: number | undefined;
  height?: number | undefined;
  pauseMutationObserver: boolean;
}) => {
  const [showPlayer, setShowPlayer] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [playerKey] = useState(0); // setPlayerKey

  return showPlayer ? (
    <>
      <MediaController id="myController">
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
          key={playerKey}
          slot="media"
          width={width}
          height={height}
          poster={poster}
          transcript={transcript}
          player="#video1"
          pause-mutation-observer={pauseMutationObserver}
        ></TimedTextPlayerComponent>
      </MediaController>
      {/* <button onClick={() => setPlayerKey(Date.now())}>reload transcript</button> */}
    </>
  ) : (
    <button onClick={() => setShowPlayer(true)}>show player</button>
  );
};
