import { ElementType, CSSProperties, PropsWithChildren } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { intersection } from 'interval-operations';

import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import type { Stack, Clip, TimedText, Gap } from './interfaces';

export const PlainDiv = ({ children }: PropsWithChildren): JSX.Element => <div>{children}</div>;

export const PlainSpan = ({ children }: PropsWithChildren): JSX.Element => <span>{children}</span>;

export const Span = ({ data }: { data: TimedText }) => {
  const start = data.marked_range.start_time;
  const end = data.marked_range.duration + start;
  return (
    <>
      <span id={data.metadata?.id} data-t={`${start},${end}`}>
        {data.texts}
      </span>{' '}
    </>
  );
};

export const Paragraph = ({
  clip,
  interval,
  dragHandleProps,
  isDragging,
  SelectionWrapper = PlainSpan as unknown as ElementType,
}: {
  clip: Clip;
  interval?: [number, number] | null | undefined;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
  SelectionWrapper?: ElementType;
}) => {
  // console.log({ clip });
  const start = clip.source_range.start_time;
  const end = clip.source_range.duration + start;

  const attrs = Object.keys(clip?.metadata?.data ?? {}).reduce((acc, key) => {
    if (!key) return acc;
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: clip.metadata.data[key],
    };
  }, {});

  const children = clip?.timed_texts ?? [];
  let before: TimedText[] = [];
  let selected: TimedText[] = [];
  let after: TimedText[] = [];
  let intersects = false;

  if (interval && intersection([start, end], interval)) {
    intersects = true;
    // attrs.style = { backgroundColor: "lightyellow" };

    before = children.filter((p) => p.marked_range.start_time + p.marked_range.duration <= interval[0]);

    after = children.filter((p) => p.marked_range.start_time >= interval[1]);

    selected = children.filter((p) => {
      const pStart = p.marked_range.start_time;
      const pEnd = pStart + p.marked_range.duration;
      return intersection([pStart, pEnd], interval);
    });
    // console.log({ before, selected, after });
  }

  // // FIXME
  // if (clip.OTIO_SCHEMA === 'Gap.1') {
  //   return <p {...attrs}>GAP</p>;
  // }

  return (
    <p {...attrs}>
      {intersects ? (
        <>
          {dragHandleProps && isDragging
            ? null
            : before.map((s, i) => <Span key={s?.metadata?.id ?? `bs-${i}`} data={s} />)}
          <SelectionWrapper>
            <span className="selection" {...dragHandleProps}>
              {selected.map((s, i) => (
                <Span key={s?.metadata?.id ?? `ss-${i}`} data={s} />
              ))}
            </span>
          </SelectionWrapper>
          {dragHandleProps && isDragging
            ? null
            : after.map((s, i) => <Span key={s?.metadata?.id ?? `as2-${i}`} data={s} />)}
        </>
      ) : (
        children.map((s, i) => <Span key={s?.metadata?.id ?? `us-${i}`} data={s} />)
      )}
    </p>
  );
};

export const Section = ({
  stack,
  offset = 0,
  interval,
  sourceId,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SelectedBlocksWrapper = PlainDiv as unknown as ElementType,
  SelectionWrapper = PlainSpan as unknown as ElementType,
}: {
  stack: Stack;
  offset?: number;
  interval?: [number, number] | null | undefined;
  sourceId?: string;
  BlockWrapper?: ElementType;
  SelectedBlocksWrapper?: ElementType;
  SelectionWrapper?: ElementType;
}) => {
  const getItemStyle = (isDragging: boolean, draggableStyle: CSSProperties): CSSProperties => ({
    userSelect: 'none',
    background: isDragging ? '#239B8B26' : 'transparent',
    ...draggableStyle,
  });

  // console.log({ stack });

  const start = stack?.source_range?.start_time ?? 0;
  const end = (stack?.source_range?.duration ?? 0) + start;
  const adjustedInterval = interval && ([interval[0] - offset, interval[1] - offset] as [number, number]);

  const attrs = Object.keys(stack?.metadata?.data).reduce((acc, key) => {
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: stack?.metadata?.data[key],
    } as Record<string, string>;
  }, {}) as unknown as Record<string, string>;

  // stack -> track[0] -> children
  const children = stack.children?.[0]?.children?.filter(
    (c: Clip | Stack | Gap) => c.OTIO_SCHEMA === 'Clip.1' || c.OTIO_SCHEMA === 'Gap.1', // FIXME TBD
  );

  let before: (Clip | Stack | Gap)[] = [];
  let selected: (Clip | Stack | Gap)[] = [];
  let after: (Clip | Stack | Gap)[] = [];
  let intersects = false;

  if (adjustedInterval && intersection([start, end], adjustedInterval)) {
    intersects = true;
    // attrs.style = { backgroundColor: "lightblue" };

    before = children.filter(
      (p) => (p as Clip).source_range.start_time + (p as Clip).source_range.duration <= adjustedInterval[0],
    );

    after = children.filter((p) => (p as Clip).source_range.start_time >= adjustedInterval[1]);

    selected = children.filter((p) => {
      const pStart = (p as Clip).source_range.start_time;
      const pEnd = pStart + (p as Clip).source_range.duration;
      return intersection([pStart, pEnd], adjustedInterval);
    });
    // console.log({ before, selected, after });
  }

  return (
    <section {...attrs} id={stack?.metadata?.id} data-offset={offset} data-sid={sourceId}>
      <Effects stack={stack} />
      {intersects ? (
        <>
          {before.map((p, i: number) => (
            <BlockWrapper key={p?.metadata?.id ?? `bP-${i}`}>
              <Paragraph clip={p as Clip} />
            </BlockWrapper>
          ))}

          <Draggable draggableId="selection" index={0}>
            {(provided, snapshot) => (
              <>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties)}
                >
                  <SelectedBlocksWrapper>
                    {selected.map((p, i: number) => (
                      <BlockWrapper key={p?.metadata?.id ?? `sP-${i}`}>
                        <Paragraph
                          clip={p as Clip}
                          interval={adjustedInterval}
                          dragHandleProps={provided.dragHandleProps}
                          isDragging={snapshot.isDragging}
                          SelectionWrapper={SelectionWrapper}
                        />
                      </BlockWrapper>
                    ))}
                  </SelectedBlocksWrapper>
                </div>
                {snapshot.isDragging && (
                  <>
                    <div
                    // style={getItemStyle(
                    //   true,
                    //   provided.draggableProps.style as CSSProperties
                    // )}
                    >
                      <SelectedBlocksWrapper>
                        {selected.map((p, i: number) => (
                          <BlockWrapper key={p?.metadata?.id ?? `s2P-${i}`}>
                            <Paragraph clip={p as Clip} />
                          </BlockWrapper>
                        ))}
                      </SelectedBlocksWrapper>
                    </div>
                  </>
                )}
              </>
            )}
          </Draggable>

          {after.map((p, i: number) => (
            <BlockWrapper key={p?.metadata?.id ?? `aP-${i}`}>
              <Paragraph clip={p as Clip} />
            </BlockWrapper>
          ))}
        </>
      ) : (
        children.map((p, i: number) => (
          <BlockWrapper key={p?.metadata?.id ?? `uP-${i}`}>
            <Paragraph clip={p as Clip} />
          </BlockWrapper>
        ))
      )}
    </section>
  );
};

const Effects = ({ stack }: { stack: Stack }) => {
  return stack?.effects?.map((e, i) => <Effect key={e?.metadata?.id ?? `e-${i}`} effect={e} />);
};

const Effect = ({ effect }: { effect: any }) => {
  const attrs = Object.keys(effect?.metadata?.data ?? {}).reduce((acc, key) => {
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: effect?.metadata?.data[key],
    } as Record<string, string>;
  }, {}) as unknown as Record<string, string>;

  return <div {...attrs}>{effect?.name}</div>;
};
