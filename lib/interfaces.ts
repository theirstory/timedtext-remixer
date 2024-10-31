/* eslint-disable @typescript-eslint/no-explicit-any */
import { DropResult } from '@hello-pangea/dnd';

export type State = {
  // TODO: verify with OTIO spec, this is a Timeline
  // sources?: Timeline[] | undefined | null;
  timestamp?: number;
  remix?: Timeline | undefined | null;
  poster?: string;
  width?: number;
  height?: number;
};

export type Action =
  | { type: 'test'; payload: any }
  | { type: 'add-widget'; payload: any }
  | { type: 'metadata'; payload: any }
  | { type: 'move'; payload: DropResult }
  | { type: 'move-up'; payload: any }
  | { type: 'move-down'; payload: any }
  | { type: 'remove'; payload: any }
  | { type: 'add'; payload: [DropResult, Timeline, [number, number]] }
  | { type: 'add-at'; payload: [string, Timeline, [number, number]] }
  | { type: 'update'; payload: any };

export interface Stack {
  OTIO_SCHEMA: string;
  metadata?: Metadata;
  name?: string;
  media_reference?: any | null;
  source_range?: TimeRange;
  children: Track[];
  effects?: Effect[];
}

export interface Timeline {
  OTIO_SCHEMA: string;
  metadata?: Metadata;
  name?: string;
  tracks: Stack;
}

export interface Metadata {
  id: string;
  story: any;
  title: string;
  videoURL: string;
}

// interface RationalTime {
//   OTIO_SCHEMA: string;
//   rate: number;
//   value: number;
// }

export interface TimeRange {
  OTIO_SCHEMA: string;
  // duration: RationalTime | Number;
  // start_time: RationalTime | Number;
  duration: number;
  start_time: number;
}

export interface Clip {
  OTIO_SCHEMA: string;
  markers?: any[];
  effects?: Effect[];
  media_reference: any | null; // Replace 'any' with a specific type if media references have a defined structure
  metadata: Metadata;
  name?: string;
  source_range: TimeRange;
  // children: Clip[]; // FIXME this should not be here, make section a composition of clips
  timed_texts?: TimedText[] | null;
}

export interface Gap {
  // TODO: verify with OTIO spec
  OTIO_SCHEMA: string;
  markers?: any[];
  media_reference: any | null; // Replace 'any' with a specific type if media references have a defined structure
  metadata: Metadata;
  name?: string;
  source_range: TimeRange;
}

export interface Track {
  OTIO_SCHEMA: string;
  // children: (Clip | Transition)[]; // Assuming Transition is another interface you have defined
  children: (Clip | Stack | Gap)[];
  kind: string;
  markers?: any[];
  metadata?: Metadata;
  name?: string;
  // source_range: TimeRange | null;
  effects?: Effect[];
}

export interface TimedText {
  OTIO_SCHEMA: string;
  metadata?: Metadata;
  name?: string;
  color?: string;
  marked_range: TimeRange;
  texts: string | string[];
  style_ids?: string[];
}

export interface Effect {
  OTIO_SCHEMA: string;
  name: string;
  metadata: Metadata;
  source_range: TimeRange; // TODO: verify with OTIO spec
}
