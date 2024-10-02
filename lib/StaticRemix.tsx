import { useMemo } from 'react';
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
// import { createComponent } from '@lit/react';
import { TimedTextPlayerComponent } from './Player.tsx';
import type { Timeline, Stack, Clip, Gap, TimedText } from './interfaces';

const KARAOKE = `
const player = document.querySelector("timedtext-player");
const transcript = document.querySelector("#transcript");
const css = document.querySelector("#css");

player.addEventListener("playhead", (e) => {
  const { section, clip, timedText, offset } = e.detail;

  if (timedText) {
    const { selector, element } = timedText.metadata;

    const cssText = \`
      \${selector} {
        color: red !important;
      }

      \${selector} ~ span {
        color: #cccccc !important;
      }

      \${clip.metadata.selector} ~ p {
        color: #cccccc;
      }

      \${section.metadata.selector} ~ section {
        color: #cccccc;
      }
    \`;

    css.textContent = cssText;
  } else {
    // css.textContent = '';
  }
});`;

export const StaticRemix = ({ remix, templates }: { remix: Timeline; templates: string }) => {
  const poster = remix?.metadata?.poster ?? 'https://placehold.co/640x360?text=16:9';

  const stacks: Stack[] = useMemo(() => {
    // TODO decide which to use and not allow both
    if ((remix?.tracks?.children?.[0]?.children ?? []).every((c) => c.OTIO_SCHEMA === 'Clip.1')) {
      return [remix?.tracks] as Stack[];
    } else {
      return remix?.tracks.children.flatMap((t) => t.children as Stack[]) as Stack[];
    }
  }, [remix]);

  return (
    <>
      <script type="module" src="https://cdn.jsdelivr.net/npm/media-chrome@4/+esm"></script>
      <script type="module" src="https://cruel-soda.surge.sh/timedtext-player.bundled.js"></script>
      <div style={{ aspectRatio: '16/9' }}>
        <MediaController style={{ width: '100%', height: '100%' }}>
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
            poster={poster}
            transcript={`#B${remix?.metadata?.id}`}
            player="#video1" // FIXME
          ></TimedTextPlayerComponent>
        </MediaController>
      </div>
      <article id={`B${remix?.metadata?.id}`}>
        {stacks.map((stack: Stack, i, stacks) => (
          <>
            {stack.metadata?.component ? null : (
              <StaticSection
                key={stack?.metadata?.id ?? `S-${i}`}
                stack={stack}
                offset={stacks.slice(0, i).reduce((acc, b) => acc + (b.source_range?.duration ?? 0), 0)}
                sourceId={stack?.metadata?.sid}
              />
            )}
          </>
        ))}
      </article>{' '}
      <style
        dangerouslySetInnerHTML={{
          __html: `div[data-component="title"]::before { content: attr(data-title); color: blue; }`,
        }}
      ></style>{' '}
      <style id="css"></style>{' '}
      <script
        dangerouslySetInnerHTML={{
          __html: KARAOKE,
        }}
      ></script>
      <div
        dangerouslySetInnerHTML={{
          __html: templates,
        }}
      />
    </>
  );
};

export const StaticSection = ({
  stack,
  offset = 0,
  sourceId,
  // source, // TBD story id?
}: {
  stack: Stack;
  offset?: number;
  interval?: [number, number] | null | undefined;
  sourceId?: string;
  droppableId?: string;
  source?: Timeline;
}) => {
  // const start = stack?.source_range?.start_time ?? 0;
  // const end = (stack?.source_range?.duration ?? 0) + start;
  // const adjustedInterval = interval && ([interval[0] - offset, interval[1] - offset] as [number, number]);

  const attrs = Object.keys(stack?.metadata?.data ?? {}).reduce((acc, key) => {
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: stack?.metadata?.data[key],
    } as Record<string, string>;
  }, {}) as unknown as Record<string, string>;

  // stack -> track[0] -> children
  const children = stack.children?.[0]?.children?.filter(
    (c: Clip | Stack | Gap) => c.OTIO_SCHEMA === 'Clip.1' || c.OTIO_SCHEMA === 'Gap.1', // FIXME TBD
  );

  return (
    <section {...attrs} id={stack?.metadata?.id} data-offset={offset} data-sid={sourceId}>
      <StaticEffects stack={stack} reverse={false} />
      {children?.map((p, i: number) => <StaticParagraph key={i} clip={p as Clip} />)}
      <StaticEffects stack={stack} reverse={true} />
    </section>
  );
};

export const StaticParagraph = ({
  clip,
  // source, // TBD story id?
}: {
  clip: Clip;
  interval?: [number, number] | null | undefined;
  isDragging?: boolean;
  droppableId?: string;
  source?: Timeline;
}) => {
  // const start = clip.source_range.start_time;
  // const end = clip.source_range.duration + start;

  const attrs = Object.keys(clip?.metadata?.data ?? {}).reduce((acc, key) => {
    if (!key) return acc;
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: clip.metadata.data[key],
    };
  }, {});

  const children = clip?.timed_texts ?? [];

  return (
    <p {...attrs}>
      {children.map((s, i) => (
        <StaticSpan key={s?.metadata?.id ?? `us-${i}`} data={s} />
      ))}
    </p>
  );
};

export const StaticSpan = ({ data }: { data: TimedText }) => {
  const start = data.marked_range.start_time;
  const end = data.marked_range.duration + start;
  return (
    <>
      <span data-t={`${start},${end}`}>{data.texts}</span>{' '}
    </>
  );
};

const StaticEffects = ({ stack, reverse = false }: { stack: Stack; reverse?: boolean }) => {
  if (reverse)
    return stack?.effects
      ?.filter((e) => e.metadata.reverse === true)
      .map((e, i) => <StaticEffect key={e?.metadata?.id ?? `e-${i}`} effect={e} />);

  return stack?.effects
    ?.filter((e) => !e.metadata.reverse) // FIXME
    .map((e, i) => <StaticEffect key={e?.metadata?.id ?? `e-${i}`} effect={e} />);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StaticEffect = ({ effect }: { effect: any }) => {
  const attrs = Object.keys(effect?.metadata?.data ?? {}).reduce((acc, key) => {
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: effect?.metadata?.data[key],
    } as Record<string, string>;
  }, {}) as unknown as Record<string, string>;

  return <div {...attrs}></div>;
};
