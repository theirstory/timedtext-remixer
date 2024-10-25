/* eslint-disable @typescript-eslint/no-explicit-any */
import { v5 as uuidv5 } from 'uuid';
import stringify from 'json-stringify-deterministic';
import CryptoJS from 'crypto-js';
import type { Clip, Metadata, Stack, TimeRange, TimedText, Track, Timeline } from "./interfaces";
import { EMPTY_VIDEO } from "./video";

export const ipfsStyleHash = (data: any): string => {
  const jsonString = stringify(data);
  const hash = CryptoJS.SHA256(jsonString).toString();
  return `Qm${hash}`;
};


export const ts2timeline = (ts: any): Timeline => {
    const TS_NAMESPACE = 'BDB8B8B5-B481-45C3-B9EC-82C5441C2A3E';
    const storyId = ts.story._id;
    const timelineUUID = uuidv5(storyId, TS_NAMESPACE);

    const { words, paragraphs } = ts.transcript;
    const totalDuration = words[words.length - 1].end ?? ts.story.duration ?? 0;

    const clips = paragraphs.map((p: any): Clip => {
      const clipUUID = uuidv5(`${p.start},${p.end}`, TS_NAMESPACE);

      const timedTexts = words
        .filter((w: any) =>
          p.start <= w.start && w.end <= p.end
        )
        .map((w: any): TimedText => {
          const timedTextUUID = uuidv5(`${w.start},${w.end}`, clipUUID);
          return {
            OTIO_SCHEMA: "TimedText.1",
            metadata: {
              id: timedTextUUID,
              data: {
                t: `${w.start},${w.end}`
              },
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
          id: clipUUID,
          speaker: p.speaker,
          data: {
            t: `${p.start},${p.end}`,
            speaker: p.speaker,
            id: clipUUID,
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
    // if (clipsStart === 0) clipsStart = 1/5; // FIXME: hack to avoid black frame at start, and fix player zero bug
    // if (clipsStart === 0) {
    //   const firstTTstart = clips[0].timed_texts[0].marked_range.start_time;
    //   const firstTTend = clips[0].timed_texts[0].marked_range.start_time + clips[0].timed_texts[0].marked_range.duration;
    //   clipsStart = firstTTstart + ((firstTTend - firstTTstart) / 2);
    // }
    const clipsEnd = lastClip?.source_range ? lastClip.source_range?.start_time + lastClip.source_range?.duration : totalDuration;

    const timeline: Timeline = {
      OTIO_SCHEMA: "Timeline.1",
      metadata: {
        id: timelineUUID,
        story: ts.story,
        title: ts.story.title,
        videoURL: ts.videoURL,
      } as Metadata,
      tracks: {
        OTIO_SCHEMA: "Stack.1",
        metadata: {
            title: ts.story.title,
        },
        children: [
          {
            OTIO_SCHEMA: "Track.1",
            kind: "video", // TBD audio only tracks
            metadata: {
            },
            children: [
              {
                OTIO_SCHEMA: "Stack.1",
                metadata: {
                    data: {
                        t: `${clipsStart},${clipsEnd}`,
                        "media-src": ts.videoURL,
                        id: timelineUUID,
                        story: storyId,
                    },
                    transcript: ts.transcript,
                    title: ts.story.title,
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

  export const timedText2timeline = (tt: any, NS: string = "F7222ED3-9A6E-4409-BCC7-F88820C07A58"): Timeline => {
    const ipfsHash = stringify(tt);
    const timelineUUID = uuidv5(tt.id ?? ipfsHash, NS);

    const { segments = [] } = tt;
    const tokens = segments.flatMap((p: any) => p.tokens ?? []);
    const start = tt.metadata?.start ?? tokens?.[0]?.start ?? 0;
    const end = tt.metadata?.end ?? tokens?.[tokens.length - 1]?.end ?? tt.metadata?.duration ?? 0;
    const totalDuration = end - start;

    const clips = segments.map((p: any): Clip => {
      const start = p.start ?? tokens?.[0]?.start ?? 0;
      const end = p.end ?? tokens?.[tokens.length - 1]?.end ?? totalDuration;
      const clipUUID = uuidv5(`${start},${end}`, timelineUUID);

      const timedTexts = (p.tokens ?? tokens)
        .filter((w: any) =>
          start <= w.start && w.end <= end
        )
        .map((w: any): TimedText => {
          const timedTextUUID = uuidv5(`${w.start},${w.end}`, clipUUID);
          return {
            OTIO_SCHEMA: "TimedText.1",
            metadata: {
              id: timedTextUUID,
              data: {
                t: `${w.start},${w.end}`
              },
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
          id: clipUUID,
          speaker: p.metadata?.speaker,
          data: {
            t: `${start},${end}`,
            speaker: p.metadata?.speaker,
            id: clipUUID,
          }
        } as Metadata,
        media_reference: {
          OTIO_SCHEMA: "MediaReference.1",
          target: tt.metadata.src,
        },
        source_range: {
          OTIO_SCHEMA: "TimeRange.1",
          start_time: start,
          duration: end - start,
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
        id: tt.id ?? timelineUUID,
        uuid: timelineUUID,
        ipfsHash,
        title: tt.metadata.title,
      } as Metadata,
      tracks: {
        OTIO_SCHEMA: "Stack.1",
        metadata: {
            title: tt.metadata.title,
        },
        children: [
          {
            OTIO_SCHEMA: "Track.1",
            kind: "video", // TBD audio only tracks
            metadata: {
            },
            children: [
              {
                OTIO_SCHEMA: "Stack.1",
                metadata: {
                    data: {
                        t: `${clipsStart},${clipsEnd}`,
                        "media-src": tt.metadata.src,
                        id: timelineUUID,
                    },
                    transcript: tt.transcript,
                    title: tt.metadata.title,
                },
                media_reference: {
                    OTIO_SCHEMA: "MediaReference.1",
                    target: tt.metadata.src,
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

export const timelineStacks = (source: Timeline): Stack[] => {
  if (source.tracks.children[0].children.every((c) => c.OTIO_SCHEMA === 'Clip.1')) {
    return [source.tracks] as Stack[];
  } else {
    return source.tracks.children.flatMap((t) => t.children as Stack[]) as Stack[];
  }
};

export const EMPTY_REMIX = {
  "OTIO_SCHEMA": "Timeline.1",
  "metadata": {
      "id": "EMPTY",
      "videoURL": EMPTY_VIDEO
  },
  "tracks": {
      "OTIO_SCHEMA": "Stack.1",
      "metadata": {
          "id": "S-EMPTY"
      },
      "children": [
          {
              "OTIO_SCHEMA": "Track.1",
              "kind": "video",
              "metadata": {
                  "remove": true,
                  "id": "T-EMPTY"
              },
              "children": []
          }
      ]
  }
};
