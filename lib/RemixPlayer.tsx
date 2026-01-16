import React, { useContext, useMemo, memo } from 'react';

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaDurationDisplay,
  MediaCaptionsButton,
  // MediaLoadingIndicator,
  MediaMuteButton,
  MediaFullscreenButton,
} from 'media-chrome/dist/react';
import { createComponent, ReactWebComponent } from '@lit/react';
import { Context } from './RemixContext';
// import { TimedTextPlayer } from '../../timedtext-player/dist/timedtext-player.js'; // FIXME
// import { TimedTextPlayer } from '@theirstoryinc/timedtext-player/dist/timedtext-player.js';
import { LitePlayer } from '@theirstoryinc/timedtext-player-lite/dist/lite-player.js';

// export const TimedTextPlayerComponent = createComponent({
//   tagName: 'timedtext-player',
//   elementClass: TimedTextPlayer,
//   react: React,
//   events: {
//     onactivate: 'activate',
//     onchange: 'change',
//   },
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// }) as any;

export const LitePlayerComponent = createComponent({
  tagName: 'lite-player',
  elementClass: LitePlayer,
  react: React,
  // events: {
  //   onactivate: 'activate',
  //   onchange: 'change',
  // },
}) as ReactWebComponent<LitePlayer>;

// const preventDefault = (e: React.MouseEvent) => e.preventDefault();
const W80H100 = { width: 'auto', height: '300px' };
const W100 = { width: '100%' };

// Memoize Media* to prevent unnecessary re-renders
// const MemoizedMediaMuteButton = memo(MediaMuteButton);
// const MemoizedMediaTimeDisplay = memo(MediaTimeDisplay);
// const MemoizedMediaPlayButton = memo(MediaPlayButton);
// const MemoizedMediaControlBar = memo(MediaControlBar);

// Memoize TimedTextPlayerComponent to prevent unnecessary re-renders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// const MemoizedTimedTextPlayerComponent = memo(TimedTextPlayerComponent) as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MemoizedLitePlayerComponent = memo(LitePlayerComponent) as any;

// TODO player props
// incl skip MediaController
export const Player = ({
  transcript,
  poster,
  // pauseMutationObserver = false,
}: {
  transcript: string;
  poster: string | undefined;
  pauseMutationObserver: boolean;
}) => {
  const { remixPlayerRef } = useContext(Context);

  // Stabilize prop references
  const memoizedTranscript = useMemo(() => transcript, [transcript]);
  const memoizedPoster = useMemo(() => poster, [poster]);
  // const memoizedPauseMutationObserver = useMemo(() => pauseMutationObserver, [pauseMutationObserver]);

  return remixPlayerRef ? (
    <>
      <MediaController style={W80H100} id="remix-player">
        <MediaControlBar style={W100}>
          <MediaPlayButton></MediaPlayButton>
          <MediaMuteButton></MediaMuteButton>
          <MediaVolumeRange></MediaVolumeRange>
          <MediaTimeDisplay></MediaTimeDisplay>
          <MediaTimeRange></MediaTimeRange>
          <MediaDurationDisplay></MediaDurationDisplay>
          <MediaCaptionsButton></MediaCaptionsButton>
          <MediaFullscreenButton></MediaFullscreenButton>
        </MediaControlBar>

        {/* <MemoizedTimedTextPlayerComponent
          ref={remixPlayerRef}
          onContextMenu={preventDefault}
          slot="media"
          style={{ borderRadius: '8px' }}
          pause-mutation-observer={memoizedPauseMutationObserver}
          poster={memoizedPoster}
          transcript={memoizedTranscript}
          player="#video1" // FIXME
        ></MemoizedTimedTextPlayerComponent> */}

        <MemoizedLitePlayerComponent
          ref={remixPlayerRef}
          slot="media"
          style={{ borderRadius: '8px' }}
          poster={memoizedPoster}
          transcript={memoizedTranscript}
        ></MemoizedLitePlayerComponent>
      </MediaController>
    </>
  ) : null;
};
