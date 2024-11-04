import type { Timeline, Stack, Clip, TimedText } from './interfaces';
export declare const StaticRemix: ({ remix, templates }: {
    remix: Timeline;
    templates: string;
}) => import("react/jsx-runtime").JSX.Element;
export declare const StaticSection: ({ stack, offset, sourceId, }: {
    stack: Stack;
    offset?: number;
    interval?: [number, number] | null | undefined;
    sourceId?: string;
    droppableId?: string;
    source?: Timeline;
}) => import("react/jsx-runtime").JSX.Element;
export declare const StaticParagraph: ({ clip, }: {
    clip: Clip;
    interval?: [number, number] | null | undefined;
    isDragging?: boolean;
    droppableId?: string;
    source?: Timeline;
}) => import("react/jsx-runtime").JSX.Element;
export declare const StaticSpan: ({ data }: {
    data: TimedText;
}) => import("react/jsx-runtime").JSX.Element;
