/* eslint-disable @typescript-eslint/no-explicit-any */
import { v5 as uuidv5 } from 'uuid';
import stringify from 'json-stringify-deterministic';
import CryptoJS from 'crypto-js';
import type { Clip, Metadata, Stack, TimeRange, TimedText, Track, Timeline } from "./interfaces";
import { EMPTY_VIDEO } from "./video";
import { applyEffects, applyEffects2 } from "./RemixContext";

export const ipfsStyleHash = (data: any): string => {
  const jsonString = stringify(data);
  const hash = CryptoJS.SHA256(jsonString).toString();
  return `Qm${hash}`;
};


// export const ts2timeline = (ts: any): Timeline => {
//   const TS_NAMESPACE = 'BDB8B8B5-B481-45C3-B9EC-82C5441C2A3E';
//   const storyId = ts.story._id;
//   const timelineUUID = uuidv5(storyId, TS_NAMESPACE);

//   const { words, paragraphs } = ts.transcript;
//   const totalDuration = words[words.length - 1].end ?? ts.story.duration ?? 0;

//   const clips = paragraphs.map((p: any): Clip => {
//     const clipUUID = uuidv5(`${p.start},${p.end}`, TS_NAMESPACE);

//     const timedTexts = words
//       .filter((w: any) =>
//         p.start <= w.start && w.end <= p.end
//       )
//       .map((w: any): TimedText => {
//         const timedTextUUID = uuidv5(`${w.start},${w.end}`, clipUUID);
//         return {
//           OTIO_SCHEMA: "TimedText.1",
//           metadata: {
//             id: timedTextUUID,
//             data: {
//               t: `${w.start},${w.end}`
//             },
//           },
//           marked_range: {
//             OTIO_SCHEMA: "TimeRange.1",
//             start_time: w.start,
//             duration: w.end - w.start,
//           },
//           texts: w.text,
//         } as any as TimedText;
//       });

//     return {
//       OTIO_SCHEMA: "Clip.1",
//       metadata: {
//         id: clipUUID,
//         speaker: p.speaker,
//         data: {
//           t: `${p.start},${p.end}`,
//           speaker: p.speaker,
//           id: clipUUID,
//         }
//       } as any as Metadata,
//       media_reference: {
//         OTIO_SCHEMA: "MediaReference.1",
//         target: ts.videoURL,
//       },
//       source_range: {
//         OTIO_SCHEMA: "TimeRange.1",
//         start_time: p.start,
//         duration: p.end - p.start,
//       } as TimeRange,
//       timed_texts: timedTexts as TimedText[],
//     };
//   }) ?? [];

//   const firstClip = clips?.[0];
//   const lastClip = clips?.[clips.length - 1];

//   const clipsStart = firstClip?.source_range?.start_time ?? 0;
//   // if (clipsStart === 0) clipsStart = 1/5; // FIXME: hack to avoid black frame at start, and fix player zero bug
//   // if (clipsStart === 0) {
//   //   const firstTTstart = clips[0].timed_texts[0].marked_range.start_time;
//   //   const firstTTend = clips[0].timed_texts[0].marked_range.start_time + clips[0].timed_texts[0].marked_range.duration;
//   //   clipsStart = firstTTstart + ((firstTTend - firstTTstart) / 2);
//   // }
//   const clipsEnd = lastClip?.source_range ? lastClip.source_range?.start_time + lastClip.source_range?.duration : totalDuration;

//   const timeline: Timeline = {
//     OTIO_SCHEMA: "Timeline.1",
//     metadata: {
//       id: timelineUUID,
//       story: ts.story,
//       title: ts.story.title,
//       videoURL: ts.videoURL,
//     } as Metadata,
//     tracks: {
//       OTIO_SCHEMA: "Stack.1",
//       metadata: {
//           title: ts.story.title,
//       },
//       children: [
//         {
//           OTIO_SCHEMA: "Track.1",
//           kind: "video", // TBD audio only tracks
//           metadata: {
//           },
//           children: [
//             {
//               OTIO_SCHEMA: "Stack.1",
//               metadata: {
//                   data: {
//                       t: `${clipsStart},${clipsEnd}`,
//                       "media-src": ts.videoURL,
//                       id: timelineUUID,
//                       story: storyId,
//                   },
//                   transcript: ts.transcript,
//                   title: ts.story.title,
//               } as any as Metadata,
//               media_reference: {
//                   OTIO_SCHEMA: "MediaReference.1",
//                   target: ts.videoURL,
//               },
//               source_range: {
//                   OTIO_SCHEMA: "TimeRange.1",
//                   start_time: clipsStart,
//                   duration: clipsEnd - clipsStart,
//               } as TimeRange,
//               children: [
//                 {
//                   OTIO_SCHEMA: "Track.1",
//                   kind: "video",
//                   children: clips as Clip[],
//                 },
//               ], // as (Clip | Stack)[],
//             },
//           ] as (Clip | Stack)[],
//           // TDB single clip as single source transcript?
//         },
//       ] as Track[],
//     } as Stack,
//   };

//   return timeline;
// };

export const ts2timeline2 = (ts: any): Timeline => {
  return timedText2timeline(ts2timedText(ts));
};

export const ts2timeline3 = (ts: any): Timeline => {
  const remix = ts2timedText3(ts);
  console.log('ts2timeline3 ' + remix.metadata.storyId, remix);
  return remix2timeline2(remix);
};

export const ts2timedText = (ts: any): any => {
  const { title, description } = ts.story;
  const { storyId, words, paragraphs } = ts.transcript;

  const segments = paragraphs.map((p: any): any => {
    return {
      start: p.start,
      end: p.end,
      metadata: {
        speaker: p.speaker,
      },
      tokens: words.filter((w: any) => p.start <= w.start && w.end <= p.end),
    };
  });

  return {
    metadata: {
      id: storyId,
      storyId,
      title,
      description,
      src: ts.videoURL,
    },
    segments,
  };
};

export const ts2timedText3 = (ts: any): Remix => {
  const { title, description } = ts.story;
  const { storyId, words, paragraphs } = ts.transcript;

  const blocks = paragraphs.map((p: any): any => {
    const tokens = words.filter((w: any) => p.start <= w.start && w.end <= p.end).map((w: any) => {
      return {
        text: w.text,
        start: w.start,
        end: w.end,
        metadata: {},
      } as Token;
    });

    return {
      text: tokens.map((t: any) => t.text).join(' '),
      start: p.start,
      end: p.end,
      metadata: {
        speaker: p.speaker,
      },
      tokens,
    } as Block;
  });

  const end = blocks[blocks.length - 1].end ?? ts.story.duration;

  return {
    metadata: {
      id: storyId,
      storyId,
      title,
      description,
      src: ts.videoURL,
    },
    segments: [{
      start: 0,
      end,
      metadata: {
        start: 0,
        end,
        src: ts.videoURL,
      },
      blocks,
    }],
  };
};

export const timedText2timeline = (tt: any, NS: string = "F7222ED3-9A6E-4409-BCC7-F88820C07A58"): Timeline => {
  const ipfsHash = ipfsStyleHash(stringify(tt));
  const timelineUUID = uuidv5(tt.id ?? tt.metadata?.id ?? ipfsHash, NS);
  const id = tt.id ?? tt.metadata?.id ?? timelineUUID;

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
        } as any as TimedText;
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
      } as any as Metadata,
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
      ...(tt.metadata ?? {}),
      id,
      uuid: timelineUUID,
      ipfsHash,
      title: tt.metadata?.title ?? id,
    } as any as Metadata,
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
                  ...(tt.metadata ?? {}),
                  data: {
                      metadata: JSON.stringify(tt.metadata ?? {}),
                      t: `${clipsStart},${clipsEnd}`,
                      "media-src": tt.metadata?.src,
                      id: timelineUUID,
                  },
              },
              media_reference: {
                  OTIO_SCHEMA: "MediaReference.1",
                  target: tt.metadata?.src,
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
          ] as any as (Clip | Stack)[],
          // TDB single clip as single source transcript?
        },
      ] as Track[],
    } as Stack,
  };

  return timeline;
};

interface Remix {
  metadata: any;
  segments: Segment[];
}
interface Segment {
  start: number;
  end: number;
  metadata: any;
  blocks: Block[];
}
interface Block {
  text: string;
  start: number;
  end: number;
  metadata: any;
  tokens: Token[];
}

interface Token {
  text: string;
  start: number;
  end: number;
  metadata: any;
}

export const stack2segment = (stack: Stack): Segment => {
  // Convert a stack back to a timed text segment
  const track = stack.children?.[0] as Track;
  const clips = (track?.children?.filter(
    (c) => c.OTIO_SCHEMA === 'Clip.1'
  ) ?? []) as Clip[];

  const blocks = clips.map(clip => {
    const tokens = clip.timed_texts?.map(tt => ({
      text: tt.texts,
      start: tt.marked_range.start_time,
      end: tt.marked_range.start_time + tt.marked_range.duration
    } as Token)) || [];

    return {
      text: clip.timed_texts?.map((tt: TimedText) => tt.texts).join(' '),
      start: clip.source_range.start_time,
      end: clip.source_range.start_time + clip.source_range.duration,
      metadata: {
        speaker: (clip.metadata as any)?.speaker,
      },
      tokens
    } as Block;
  });

  // throw error if there is no source_range start_time or duration
  if (!stack.source_range || typeof stack.source_range.start_time === 'undefined' || isNaN(stack.source_range.start_time) || typeof stack.source_range.duration === 'undefined' || isNaN(stack.source_range.duration)) {
    console.log('stack', stack);
    throw new Error('source_range start_time or duration is missing');
  }

  return {
    metadata: {
      ...(stack.metadata ?? {}),
      start: stack.source_range.start_time,
      end: stack.source_range.start_time + stack.source_range.duration,
      src: (stack.metadata as any)?.data?.['media-src'] // FIXME: we always need source?
    },
    blocks,
    start: stack.source_range.start_time,
    end: stack.source_range.start_time + stack.source_range.duration
  } as Segment;
};

export const timeline2remix2 = (source: Timeline): Remix => {
  const stacks = timelineStacks(source);
  const segments = stacks.map(stack2segment);

  return {
    metadata: source.metadata,
    segments,
  } as Remix;
};

const segment2stack = (segment: Segment): Stack => {
  const { metadata, blocks, start, end } = segment;
  const clips = blocks.map((b: Block) => {
    const { text, start, end, metadata, tokens } = b;
    const clipUUID = uuidv5(`${start},${end}`, "F7222ED3-9A6E-4409-BCC7-F88820C07A58");

    const timedTexts = tokens.map((t: Token) => {
      const timedTextUUID = uuidv5(`${t.start},${t.end}`, clipUUID);
      return {
        OTIO_SCHEMA: "TimedText.1",
        metadata: {
          id: timedTextUUID,
          data: {
            t: `${t.start},${t.end}`
          },
        },
        marked_range: {
          OTIO_SCHEMA: "TimeRange.1",
          start_time: t.start,
          duration: t.end - t.start,
        },
        texts: t.text,
      } as any as TimedText;
    });

    return {
      OTIO_SCHEMA: "Clip.1",
      metadata: {
        id: clipUUID,
        speaker: metadata.speaker,
        data: {
          t: `${start},${end}`,
          speaker: metadata.speaker,
          id: clipUUID,
        }
      } as any as Metadata,
      media_reference: {
        OTIO_SCHEMA: "MediaReference.1",
        target: metadata.src,
      },
      source_range: {
        OTIO_SCHEMA: "TimeRange.1",
        start_time: start,
        duration: end - start,
      } as TimeRange,
      timed_texts: timedTexts as TimedText[],
    };
  });

  return {
    OTIO_SCHEMA: "Stack.1",
    metadata: {
      ...(metadata ?? {}),
      data: {
        t: `${metadata.start},${metadata.end}`, // FIXME: should we use start and end?
        "media-src": metadata.src,
      },
    },
    media_reference: {
      OTIO_SCHEMA: "MediaReference.1",
      target: metadata.src,
    },
    source_range: {
      OTIO_SCHEMA: "TimeRange.1",
      start_time: start,
      duration: end - start,
    },
    children: [
      {
        OTIO_SCHEMA: "Track.1",
        kind: "video",
        children: clips as Clip[],
      },
    ],
  } as Stack;
};

export const remix2timeline2 = (remix: Remix): Timeline => {
  const { metadata, segments } = remix;
  // const timelines = segments.map((s: Segment) => segment2stack(s));

  const timeline: Timeline = {
    OTIO_SCHEMA: "Timeline.1",
    metadata: {
      ...(metadata ?? {}),
    } as any as Metadata,
    tracks: {
      OTIO_SCHEMA: "Stack.1",
      metadata: {
          title: metadata.title,
      },
      children: [
        {
          OTIO_SCHEMA: "Track.1",
          kind: "video", // TBD audio only tracks
          metadata: {
          },
          children: [
            // ...timelines.map((t: Timeline): Stack => ({
            //   OTIO_SCHEMA: "Stack.1",
            //   metadata: {
            //     ...t.metadata,
            //   },
            //   children: applyEffects(timelineStacks(t).flatMap((s: Stack) => s.children)),
            //   source_range: t.source_range,
            //   media_reference: t.media_reference,
            // } as Stack)),
            // ...segments.map(segment2stack),
            ...applyEffects2(segments.map(segment2stack)),
          ] as any as (Clip | Stack)[],
          // TDB single clip as single source transcript?
        },
      ] as Track[],
    } as Stack,
  };

  return timeline;
};

export const stack2timedText = (stack: Stack): any => {
  // Convert a stack back to timed text segments
  const track = stack.children?.[0] as Track;
  const clips = (track?.children?.filter(
    (c) => c.OTIO_SCHEMA === 'Clip.1'
  ) ?? []) as Clip[];

  const segments = clips.map(clip => {
    const tokens = clip.timed_texts?.map(tt => ({
      text: tt.texts,
      start: tt.marked_range.start_time,
      end: tt.marked_range.start_time + tt.marked_range.duration
    })) || [];

    return {
      text: clip.timed_texts?.map((tt: TimedText) => tt.texts).join(' '),
      start: clip.source_range.start_time,
      end: clip.source_range.start_time + clip.source_range.duration,
      metadata: {
        speaker: (clip.metadata as any)?.speaker,
      },
      tokens
    };
  });

  return {
    metadata: {
      ...(stack.metadata ?? {}),
      start: stack?.source_range?.start_time ?? 0,
      end: (stack?.source_range?.start_time ?? 0) + (stack?.source_range?.duration ?? 0),
      src: (stack.metadata as any)?.data?.['media-src']
    },
    segments
  };
};

// export const remix2timeline = (remix: any): Timeline => {
//   const { metadata, items } = remix;
//   const timelines = items.map((i: any) => timedText2timeline(i, "F7222ED3-9A6E-4409-BCC7-F88820C07A58"));

//   const timeline: Timeline = {
//     OTIO_SCHEMA: "Timeline.1",
//     metadata: {
//       ...(metadata ?? {}),
//     } as any as Metadata,
//     tracks: {
//       OTIO_SCHEMA: "Stack.1",
//       metadata: {
//           title: metadata.title,
//       },
//       children: [
//         {
//           OTIO_SCHEMA: "Track.1",
//           kind: "video", // TBD audio only tracks
//           metadata: {
//           },
//           children: [
//             ...timelines.map((t: Timeline) => ({
//               OTIO_SCHEMA: "Stack.1",
//               metadata: {
//                 ...t.metadata,
//               },
//               children: applyEffects(timelineStacks(t).flatMap((s: Stack) => s.children)),
//             })),
//           ] as any as (Clip | Stack)[],
//           // TDB single clip as single source transcript?
//         },
//       ] as Track[],
//     } as Stack,
//   };

//   return timeline;
// };

// export const timeline2remix = (source: Timeline): any => {
//   const stacks = timelineStacks(source);
//   const items = stacks.map(stack2timedText);
//   return {
//     metadata:source.metadata,
//     items,
//   };
// };

export const timelineStacks = (source: Timeline): Stack[] => {
  console.log('timelineStacks?', source);
  if (!source.tracks) return [source as unknown as Stack] as Stack[];
  if (source.tracks.children?.[0]?.children?.every((c) => c.OTIO_SCHEMA === 'Clip.1')) {
    return [source.tracks] as Stack[];
  } else {
    return source.tracks.children?.flatMap((t) => t?.children as Stack[]) as Stack[];
  }
};

const GAP_VIDEO = EMPTY_VIDEO; // blackHLS(10);

export const EMPTY_REMIX = {
  "OTIO_SCHEMA": "Timeline.1",
  "metadata": {
      "id": "EMPTY",
      "videoURL": GAP_VIDEO
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
              "children": [
                // {
                //   "OTIO_SCHEMA": "Stack.1",
                //   "metadata": {
                //     "id": "gap-1",
                //     "data": {
                //       "t": [0, 10],
                //       "media-src": GAP_VIDEO
                //     },
                //     "title": "GAP",
                //     "widget": "gap"
                //   },
                //   "media_reference": {
                //     "OTIO_SCHEMA": "MediaReference.1",
                //     "target": GAP_VIDEO
                //   },
                //   "source_range": {
                //     "OTIO_SCHEMA": "TimeRange.1",
                //     "start_time": 0,
                //     "duration": 10
                //   },
                //   "children": [],
                //   "effects": []
                // }
              ]
          }
      ]
  }
};
// TODO add back the track and a gap on the track
