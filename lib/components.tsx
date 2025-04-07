import { ElementType, CSSProperties, PropsWithChildren, memo, useRef, useState, useCallback, useEffect } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { intersection } from 'interval-operations';

import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import type { Timeline, Stack, Clip, TimedText, Gap } from './interfaces';
import { Tool } from './RemixDestination';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';

export const PlainDiv = ({ children }: PropsWithChildren): JSX.Element => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{children}</div>
);

export const PlainSpan = ({ children }: PropsWithChildren): JSX.Element => <span>{children}</span>;

export const Span = memo(({ data }: { data: TimedText }) => {
  const start = data.marked_range.start_time;
  const end = data.marked_range.duration + start;
  return (
    <>
      <span id={data.metadata?.id} data-t={`${start},${end}`}>
        {data.texts}
      </span>{' '}
    </>
  );
});

export const Paragraph = memo(
  ({
    clip,
    interval,
    text,
    dragHandleProps,
    isDragging,
    droppableId,
    source,
    SelectionWrapper = PlainSpan as unknown as ElementType,
  }: {
    clip: Clip;
    interval?: [number, number] | null | undefined;
    text?: string;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    isDragging?: boolean;
    droppableId?: string;
    source?: Timeline;
    SelectionWrapper?: ElementType;
  }) => {
    const start = clip.source_range.start_time;
    const end = clip.source_range.duration + start;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs = Object.keys((clip?.metadata as any)?.data ?? {}).reduce((acc, key) => {
      if (!key) return acc;
      return {
        ...acc,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [`data-${key.replaceAll('_', '-')}`]: (clip.metadata as any)?.data[key],
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
      <p {...attrs} style={{ margin: 0 }}>
        {intersects ? (
          <>
            {dragHandleProps && isDragging ? null : before.map((s, i) => <Span key={`bs-${i}`} data={s} />)}
            <SelectionWrapper
              first={selected[0].marked_range.start_time === interval?.[0] && !isDragging}
              droppableId={droppableId}
              source={source}
              text={text}
            >
              <span className="selection" {...dragHandleProps}>
                {selected.map((s, i) => (
                  <Span key={`ss-${i}`} data={s} />
                ))}
              </span>
            </SelectionWrapper>
            {dragHandleProps && isDragging ? null : after.map((s, i) => <Span key={`as2-${i}`} data={s} />)}
          </>
        ) : (
          children.map((s, i) => <Span key={`us-${i}`} data={s} />)
        )}
      </p>
    );
  },
);

export const Section = memo(
  ({
    stack,
    offset = 0,
    interval,
    sourceId,
    droppableId,
    source,
    BlockWrapper = PlainDiv as unknown as ElementType,
    SelectedBlocksWrapper = PlainDiv as unknown as ElementType,
    SelectionWrapper = PlainSpan as unknown as ElementType,
    SectionContentWrapper = PlainDiv as unknown as ElementType,
    tools = [],
  }: {
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools?: any[] | undefined;
  }) => {
    const getItemStyle = (isDragging: boolean, draggableStyle: CSSProperties): CSSProperties => ({
      ...draggableStyle,
      userSelect: 'none',
      background: 'transparent',
      width: isDragging ? 'fit-content' : '100%',
      height: isDragging ? 'fit-content' : 'auto',
    });

    const [firstRender, setFirstRender] = useState(true);
    useEffect(() => {
      if (firstRender) {
        setFirstRender(false);
      }
    }, [firstRender]);
    // TODO reset firstRender on stack change?

    const start = stack?.source_range?.start_time ?? 0;
    const end = (stack?.source_range?.duration ?? 0) + start;
    const adjustedInterval = interval && ([interval[0] - offset, interval[1] - offset] as [number, number]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const attrs = Object.keys((stack?.metadata as any)?.data ?? {}).reduce((acc, key) => {
      return {
        ...acc,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [`data-${key.replaceAll('_', '-')}`]: (stack?.metadata as any)?.data[key],
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
    let text = '';

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
      text = selected
        .map((s) => {
          if ((s as Clip).OTIO_SCHEMA === 'Clip.1') {
            return (s as Clip).timed_texts?.map((t) => t.texts).join(' ');
          }
          return '';
        })
        .join(' ')
        .split(' ')
        .slice(0, 30) // limit to 30 words max
        .join(' ');
    }

    const sectionRef = useRef<HTMLDivElement>(null);
    const sectionWidth = sectionRef.current?.clientWidth;
    const ref = useRef<HTMLDivElement>(null);
    const [y, setY] = useState(0);
    const [mouseY, setMouseY] = useState(0);
    const recordMouseY = useCallback(
      (e: React.MouseEvent<HTMLDivElement>) => {
        setMouseY(e.clientY);
        if (ref.current) {
          setY((ref.current as unknown as HTMLElement).getBoundingClientRect().y);
        }
      },
      [ref],
    );

    // FIXME
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (interval) (globalThis as any).foo = `selection-${interval?.[0]}-${interval?.[1]}`;

    // TODO use a different set of tool array for in-section widgets
    return (
      <section
        {...attrs}
        id={stack?.metadata?.id}
        data-offset={offset}
        data-sid={sourceId}
        style={{ padding: 0, border: 'none', marginBottom: 0 }}
        ref={sectionRef}
      >
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (stack.metadata as any)?.widget &&
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            tools?.find((t) => t.type === (stack.metadata as any)?.widget)?.timelineComponent && (
              <Tool
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                Component={tools.find((t) => t.type === (stack.metadata as any)?.widget).timelineComponent}
                stack={stack}
                id={stack?.metadata?.id ?? 'missing-tool-id'}
              />
            )
        }
        <SectionContentWrapper metadata={stack?.metadata}>
          <Effects stack={stack} />
          {intersects ? (
            <>
              {before.map((p, i: number) => (
                <BlockWrapper key={p?.metadata?.id ?? `bP-${i}`} metadata={p?.metadata} start={start} offset={offset}>
                  <Paragraph clip={p as Clip} />
                </BlockWrapper>
              ))}

              <Draggable draggableId={`selection-${interval?.[0]}-${interval?.[1]}`} index={0}>
                {(provided, snapshot) => {
                  return (
                    <>
                      <div ref={ref} style={{ height: 0 }}></div>
                      <div
                        key={`${interval?.[0]}-${interval?.[1]}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={{
                          ...getItemStyle(snapshot.isDragging, provided.draggableProps.style as CSSProperties),
                          height: snapshot.isDragging ? 50 : 'fit-content',
                        }}
                        onMouseDown={recordMouseY}
                      >
                        {snapshot.isDragging ? (
                          <div
                            id="dragging-element"
                            style={{
                              borderRadius: '8px',
                              border: '1px solid #D9DCDE',
                              backgroundColor: '#FFF',
                              boxShadow: '0px 10px 12px 0px rgba(0, 0, 0, 0.20)',
                              padding: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              columnGap: '6px',
                              position: 'fixed',
                              // top: '0',
                              top: ref.current ? mouseY - y - 25 : 0,
                            }}
                          >
                            <PlaylistAddIcon style={{ width: '20px', height: '20px', color: '#606971' }} />
                            <p
                              style={{
                                margin: 0,
                                fontWeight: 600,
                                color: '#606971',
                                fontSize: '12px',
                                lineHeight: '16px',
                                width: sectionWidth,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {text}
                            </p>
                          </div>
                        ) : (
                          <SelectedBlocksWrapper>
                            {selected.map((p, i: number) => (
                              <BlockWrapper
                                key={p?.metadata?.id ?? `sP-${i}`}
                                metadata={p?.metadata}
                                start={start}
                                offset={offset}
                              >
                                <Paragraph
                                  clip={p as Clip}
                                  interval={adjustedInterval}
                                  dragHandleProps={provided.dragHandleProps}
                                  isDragging={snapshot.isDragging}
                                  SelectionWrapper={SelectionWrapper}
                                  droppableId={droppableId}
                                  source={source}
                                />
                              </BlockWrapper>
                            ))}
                          </SelectedBlocksWrapper>
                        )}
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
                                <BlockWrapper
                                  key={p?.metadata?.id ?? `s2P-${i}`}
                                  metadata={p?.metadata}
                                  start={start}
                                  offset={offset}
                                >
                                  <Paragraph clip={p as Clip} />
                                </BlockWrapper>
                              ))}
                            </SelectedBlocksWrapper>
                          </div>
                        </>
                      )}
                    </>
                  );
                }}
              </Draggable>

              {after.map((p, i: number) => (
                <BlockWrapper key={p?.metadata?.id ?? `aP-${i}`} metadata={p?.metadata} start={start} offset={offset}>
                  <Paragraph clip={p as Clip} />
                </BlockWrapper>
              ))}
            </>
          ) : (
            // children?.map((p, i: number) => (
            //   <BlockWrapper key={p?.metadata?.id ?? `uP-${i}`} metadata={p?.metadata} start={start} offset={offset}>
            //     <Paragraph clip={p as Clip} />
            //   </BlockWrapper>
            // ))
            <Paragraphs
              paragraphs={children as Clip[]}
              start={start}
              offset={offset}
              BlockWrapper={BlockWrapper}
              firstRender={firstRender}
            />
          )}
        </SectionContentWrapper>
      </section>
    );
  },
);

const Effects = ({ stack }: { stack: Stack }) => {
  return stack?.effects?.map((e, i) => <Effect key={e?.metadata?.id ?? `e-${i}`} effect={e} />);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Effect = ({ effect }: { effect: any }) => {
  const attrs = Object.keys(effect?.metadata?.data ?? {}).reduce((acc, key) => {
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: effect?.metadata?.data[key],
    } as Record<string, string>;
  }, {}) as unknown as Record<string, string>;

  return <div {...attrs}></div>;
};

const Paragraphs = ({
  paragraphs = [],
  start,
  offset,
  BlockWrapper,
  firstRender,
}: {
  paragraphs: Clip[];
  start: number;
  offset: number;
  BlockWrapper: ElementType;
  firstRender: boolean;
}) => {
  const [position, setPosition] = useState(firstRender ? 1 : paragraphs.length);

  useEffect(() => {
    if (position < paragraphs.length) setPosition(position + 1);
  }, [position, paragraphs]);

  return paragraphs.slice(0, position).map((p, i: number) => (
    <BlockWrapper key={p?.metadata?.id ?? `uP-${i}`} metadata={p?.metadata} start={start} offset={offset}>
      <Paragraph clip={p as Clip} />
    </BlockWrapper>
  ));
};
