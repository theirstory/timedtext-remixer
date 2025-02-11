import React, { useContext, memo, useMemo } from 'react';

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaDurationDisplay,
  // MediaCaptionsButton,
  // MediaLoadingIndicator,
  MediaMuteButton,
  MediaFullscreenButton,
} from 'media-chrome/dist/react';
import { createComponent } from '@lit/react';
import { Context } from './RemixContext';
// import { TimedTextPlayer } from '../../timedtext-player/dist/timedtext-player.js'; // FIXME
import { TimedTextPlayer } from '@theirstoryinc/timedtext-player/dist/timedtext-player.js';

export const TimedTextPlayerComponent = createComponent({
  tagName: 'timedtext-player',
  elementClass: TimedTextPlayer,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}) as any;

const preventDefault = (e: React.MouseEvent) => e.preventDefault();
const W80H100 = { width: 'auto', height: '300px' };
const W100 = { width: '100%' };

// Memoize Media* to prevent unnecessary re-renders
const MemoizedMediaMuteButton = memo(MediaMuteButton);
const MemoizedMediaTimeDisplay = memo(MediaTimeDisplay);
const MemoizedMediaPlayButton = memo(MediaPlayButton);
const MemoizedMediaControlBar = memo(MediaControlBar);

// Memoize TimedTextPlayerComponent to prevent unnecessary re-renders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MemoizedTimedTextPlayerComponent = memo(TimedTextPlayerComponent) as any;

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
      <MediaController id="myController" style={W80H100}>
        <MemoizedMediaControlBar style={W100}>
          <MemoizedMediaPlayButton></MemoizedMediaPlayButton>
          <MemoizedMediaMuteButton></MemoizedMediaMuteButton>
          <MediaVolumeRange></MediaVolumeRange>
          <MemoizedMediaTimeDisplay></MemoizedMediaTimeDisplay>
          <MediaTimeRange></MediaTimeRange>
          <MediaDurationDisplay></MediaDurationDisplay>
          {/* <MediaCaptionsButton></MediaCaptionsButton> */}
          <MediaFullscreenButton></MediaFullscreenButton>
        </MemoizedMediaControlBar>

        <MemoizedTimedTextPlayerComponent
          ref={remixPlayerRef}
          onContextMenu={preventDefault}
          slot="media"
          style={{ borderRadius: '8px' }}
          pause-mutation-observer={memoizedPauseMutationObserver}
          poster={memoizedPoster}
          transcript={memoizedTranscript}
          player="#video1" // FIXME
        ></MemoizedTimedTextPlayerComponent>
        {/* <MediaLoadingIndicator slot="centered-chrome" loadingdelay="1000"></MediaLoadingIndicator> */}
      </MediaController>
    </>
  ) : null;
};
