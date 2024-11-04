import { ElementType, PropsWithChildren } from 'react';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import type { Timeline, Stack, Clip, TimedText } from './interfaces';
export declare const PlainDiv: ({ children }: PropsWithChildren) => JSX.Element;
export declare const PlainSpan: ({ children }: PropsWithChildren) => JSX.Element;
export declare const Span: import("react").MemoExoticComponent<({ data }: {
    data: TimedText;
}) => import("react/jsx-runtime").JSX.Element>;
export declare const Paragraph: import("react").MemoExoticComponent<({ clip, interval, dragHandleProps, isDragging, droppableId, source, SelectionWrapper, }: {
    clip: Clip;
    interval?: [number, number] | null | undefined;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    isDragging?: boolean;
    droppableId?: string;
    source?: Timeline;
    SelectionWrapper?: ElementType;
}) => import("react/jsx-runtime").JSX.Element>;
export declare const Section: import("react").MemoExoticComponent<({ stack, offset, interval, sourceId, droppableId, source, BlockWrapper, SelectedBlocksWrapper, SelectionWrapper, SectionContentWrapper, }: {
    stack: Stack;
    offset?: number;
    interval?: [number, number] | null | undefined;
    sourceId?: string;
    droppableId?: string;
    source?: Timeline;
    BlockWrapper?: ElementType;
    SelectedBlocksWrapper?: ElementType;
    SelectionWrapper?: ElementType;
    SectionContentWrapper?: ElementType;
}) => import("react/jsx-runtime").JSX.Element>;
