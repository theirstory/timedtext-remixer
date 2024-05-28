/* eslint-disable @typescript-eslint/no-explicit-any */
// import { intersection } from "interval-operations";
import type { Clip, Metadata, Stack, TimeRange, TimedText, Track, Timeline } from "./interfaces";
import { nanoid } from "nanoid";

export const ts2timeline = (ts: any): Timeline => {
    const { words, paragraphs } = ts.transcript;
    const totalDuration = words[words.length - 1].end ?? ts.story.duration ?? 0;

    const clips = paragraphs.map((p: any): Clip => {
      const timedTexts = words
        .filter((w: any) =>
          // intersection([w.start, w.end], [p.start, p.end])
          p.start <= w.start && w.end <= p.end
        )
        .map((w: any): TimedText => {
          return {
            OTIO_SCHEMA: "TimedText.1",
            metadata: {
              id: `TT-${nanoid()}`,
              data: {
                t: `${w.start},${w.end}`
              }
            },
            marked_range: {
              OTIO_SCHEMA: "TimeRange.1",
              start_time: w.start,
              duration: w.end - w.start,
            },
            texts: w.text,
          } as TimedText;
        });

      return {
        OTIO_SCHEMA: "Clip.1",
        metadata: {
          id: `C-${nanoid()}`,
          speaker: p.speaker,
          data: {
            t: `${p.start},${p.end}`
          }
        } as Metadata,
        media_reference: {
          OTIO_SCHEMA: "MediaReference.1",
          target: ts.videoURL,
        },
        source_range: {
          OTIO_SCHEMA: "TimeRange.1",
          start_time: p.start,
          duration: p.end - p.start,
        } as TimeRange,
        timed_texts: timedTexts as TimedText[],
      };
    }) ?? [];

    const firstClip = clips?.[0];
    const lastClip = clips?.[clips.length - 1];

    const clipsStart = firstClip?.source_range?.start_time ?? 0;
    const clipsEnd = lastClip?.source_range ? lastClip.source_range?.start_time + lastClip.source_range?.duration : totalDuration;

    const timeline: Timeline = {
      OTIO_SCHEMA: "Timeline.1",
      metadata: {
        id: ts.transcript._id, // TODO TBD
        story: ts.story,
        videoURL: ts.videoURL,
      } as Metadata,
      tracks: {
        OTIO_SCHEMA: "Stack.1",
        metadata: {
            id: `S-${nanoid()}`,
        },
        // media_reference: {
        //   OTIO_SCHEMA: "MediaReference.1",
        //   target: ts.videoURL,
        // },
        // source_range: {
        //   OTIO_SCHEMA: "TimeRange.1",
        //   start_time: 0,
        //   duration: totalDuration,
        // } as TimeRange,
        children: [
          {
            OTIO_SCHEMA: "Track.1",
            kind: "video", // TBD audio only tracks
            metadata: {
                id: `T-${nanoid()}`,
            },
            children: [
              {
                OTIO_SCHEMA: "Stack.1",
                metadata: {
                    id: `S-${nanoid()}`,
                    data: {
                        t: `${clipsStart},${clipsEnd}`
                    },
                    transcript: ts.transcript,
                },
                media_reference: {
                    OTIO_SCHEMA: "MediaReference.1",
                    target: ts.videoURL,
                },
                source_range: {
                    OTIO_SCHEMA: "TimeRange.1",
                    start_time: clipsStart,
                    duration: clipsEnd - clipsStart,
                } as TimeRange,
                children: [
                  {
                    OTIO_SCHEMA: "Track.1",
                    kind: "video",
                    children: clips as Clip[],
                  },
                ], // as (Clip | Stack)[],
              },
            ] as (Clip | Stack)[],
            // TDB single clip as single source transcript?
          },
        ] as Track[],
      } as Stack,
    };

    return timeline;
  };
