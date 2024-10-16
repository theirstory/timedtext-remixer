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
