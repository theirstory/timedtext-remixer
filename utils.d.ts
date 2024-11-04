import type { Stack, Timeline } from "./interfaces";
export declare const ipfsStyleHash: (data: any) => string;
export declare const ts2timeline: (ts: any) => Timeline;
export declare const timedText2timeline: (tt: any, NS?: string) => Timeline;
export declare const timelineStacks: (source: Timeline) => Stack[];
export declare const EMPTY_REMIX: {
    OTIO_SCHEMA: string;
    metadata: {
        id: string;
        videoURL: string;
    };
    tracks: {
        OTIO_SCHEMA: string;
        metadata: {
            id: string;
        };
        children: {
            OTIO_SCHEMA: string;
            kind: string;
            metadata: {
                remove: boolean;
                id: string;
            };
            children: never[];
        }[];
    };
};
