import React, { useContext, memo, useMemo } from 'react';

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
import { Context } from './RemixContext';
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

const preventDefault = (e: React.MouseEvent) => e.preventDefault();
const WH100 = { width: '100%', height: '100%' };
const W100 = { width: '100%' };

// Memoize Media* to prevent unnecessary re-renders
const MemoizedMediaMuteButton = memo(MediaMuteButton);
const MemoizedMediaTimeDisplay = memo(MediaTimeDisplay);
const MemoizedMediaPlayButton = memo(MediaPlayButton);
const MemoizedMediaControlBar = memo(MediaControlBar);

// Memoize TimedTextPlayerComponent to prevent unnecessary re-renders
const MemoizedTimedTextPlayerComponent = memo(TimedTextPlayerComponent);

// TODO player props
// incl skip MediaController
export const Player = ({
  transcript,
  poster,
  pauseMutationObserver = false,
}: {
  transcript: string;
  poster: string | undefined;
  pauseMutationObserver: boolean;
}) => {
  const { remixPlayerRef } = useContext(Context);

  // Stabilize prop references
  const memoizedTranscript = useMemo(() => transcript, [transcript]);
  const memoizedPoster = useMemo(() => poster, [poster]);
  const memoizedPauseMutationObserver = useMemo(() => pauseMutationObserver, [pauseMutationObserver]);

  return remixPlayerRef ? (
    <>
      <MediaController id="myController" style={WH100}>
        <MemoizedMediaControlBar style={W100}>
          <MemoizedMediaPlayButton></MemoizedMediaPlayButton>
          <MemoizedMediaMuteButton></MemoizedMediaMuteButton>
          <MediaVolumeRange></MediaVolumeRange>
          <MemoizedMediaTimeDisplay></MemoizedMediaTimeDisplay>
          <MediaTimeRange></MediaTimeRange>
          <MediaDurationDisplay></MediaDurationDisplay>
          <MediaCaptionsButton></MediaCaptionsButton>
          <MediaFullscreenButton></MediaFullscreenButton>
        </MemoizedMediaControlBar>

        <MemoizedTimedTextPlayerComponent
          ref={remixPlayerRef}
          onContextMenu={preventDefault}
          slot="media"
          pause-mutation-observer={memoizedPauseMutationObserver}
          poster={memoizedPoster}
          transcript={memoizedTranscript}
          player="#video1" // FIXME
        ></MemoizedTimedTextPlayerComponent>
      </MediaController>
    </>
  ) : null;
};
