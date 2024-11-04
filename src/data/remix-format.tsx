/* eslint-disable @typescript-eslint/no-explicit-any */
// HTML or OTIO equivalent, + metadata, + resolvers, + templates, + karaoke as template?, + player as template?

export interface Item {
  id: string;
  type: string;
  metadata: Record<string, any>;

  name?: string;
  enabled?: boolean;

  effects?: Effect[];
  markers?: Marker[];

  media_reference?: MediaReference;
  source_range?: TimeRange;

  children?: any[];
}

export const tt_example = {
  id: 'Qm123',
  metadata: {
    start: 0,
    end: 10,
    src: 'https://example.com/video.mp4',
  },
  segments: [
    {
      metadata: {
        speaker: 'Speaker 1',
      },
      tokens: [{ start: 0, end: 1, text: 'Hello, world!' }],
    },
  ],
};
