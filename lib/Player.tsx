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
} from 'media-chrome/dist/react';
import { createComponent } from '@lit/react';
import { TimedTextPlayer } from '../timedtext-player-2/dist/timedtext-player.js'; // FIXME

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
  pauseMutationObserver = false,
}: {
  transcript: string;
  pauseMutationObserver: boolean;
}) => {
  const [showPlayer, setShowPlayer] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // const [playerKey, setPlayerKey] = useState(0);

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
        </MediaControlBar>

        <TimedTextPlayerComponent
          // key={playerKey}
          slot="media"
          width={620}
          height={360}
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
