export interface Metadata {
    [key: string]: any;
}
export interface TimeRange {
    OTIO_SCHEMA: string;
    duration: number;
    start_time: number;
}
export interface Clip {
    OTIO_SCHEMA: string;
    markers: any[];
    effects: Effect[];
    media_reference: any | null;
    metadata: Metadata;
    name: string;
    source_range: TimeRange;
    children: Clip[];
    timed_texts: TimedText[] | null;
}
export interface Gap {
    OTIO_SCHEMA: string;
    markers: any[];
    media_reference: any | null;
    metadata: Metadata;
    name: string;
    source_range: TimeRange;
}
export interface Track {
    OTIO_SCHEMA: string;
    children: Clip[];
    kind: string;
    markers: any[];
    metadata: Metadata;
    name: string;
    effects: Effect[];
}
export interface TimedText {
    OTIO_SCHEMA: string;
    metadata: Metadata;
    name: string;
    color: string;
    marked_range: TimeRange;
    texts: string | string[];
    style_ids: string[];
}
export interface Effect {
    OTIO_SCHEMA: string;
    name: string;
    metadata: Metadata;
    source_range: TimeRange;
}
//# sourceMappingURL=interfaces.d.ts.map