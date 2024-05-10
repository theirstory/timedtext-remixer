import { ElementType, CSSProperties, PropsWithChildren } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { intersection } from "interval-operations";

import type { DraggableProvidedDragHandleProps } from "@hello-pangea/dnd";
import type { Clip, TimedText } from "./interfaces";

export const PlainDiv = ({ children }: PropsWithChildren): JSX.Element => (
  <div>{children}</div>
);

export const PlainSpan = ({ children }: PropsWithChildren): JSX.Element => (
  <span>{children}</span>
);

export const Span = ({ data }: { data: TimedText }) => {
  const start = data.marked_range.start_time;
  const end = data.marked_range.duration + start;
  return (
    <>
      <span id={data.metadata?.id} data-t={`${start},${end}`}>
        {data.texts}
      </span>{" "}
    </>
  );
};

export const Paragraph = ({
  data,
  interval,
  dragHandleProps,
  isDragging,
  SelectionWrapper = PlainSpan as unknown as ElementType,
}: {
  data: Clip;
  interval?: [number, number] | null | undefined;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  isDragging?: boolean;
  SelectionWrapper?: ElementType;
}) => {
  const start = data.source_range.start_time;
  const end = data.source_range.duration + start;

  const attrs = Object.keys(data?.metadata?.data ?? {}).reduce((acc, key) => {
    if (!key) return acc;
    return {
      ...acc,
      [`data-${key.replaceAll("_", "-")}`]: data.metadata.data[key],
    };
  }, {});

  const children = data?.timed_texts ?? [];
  let before: TimedText[] = [];
  let selected: TimedText[] = [];
  let after: TimedText[] = [];
  let intersects = false;

  if (interval && intersection([start, end], interval)) {
    intersects = true;
    // attrs.style = { backgroundColor: "lightyellow" };

    before = children.filter(
      (p) => p.marked_range.start_time + p.marked_range.duration < interval[0]
    );

    after = children.filter((p) => p.marked_range.start_time > interval[1]);

    selected = children.filter((p) => {
      const pStart = p.marked_range.start_time;
      const pEnd = pStart + p.marked_range.duration;
      return intersection([pStart, pEnd], interval);
    });
    // console.log({ before, selected, after });
  }

  return (
    <p {...attrs}>
      {intersects ? (
        <>
          {dragHandleProps && isDragging
            ? null
            : before.map((s, i) => (
                <Span key={s.metadata.id ?? `s-${i}`} data={s} />
              ))}
          <SelectionWrapper>
            <span className="selection" {...dragHandleProps}>
              {selected.map((s, i) => (
                <Span key={s.metadata.id ?? `s-${i}`} data={s} />
              ))}
            </span>
          </SelectionWrapper>
          {dragHandleProps && isDragging
            ? null
            : after.map((s, i) => (
                <Span key={s.metadata.id ?? `s-${i}`} data={s} />
              ))}
        </>
      ) : (
        children.map((s, i) => (
          <Span key={s.metadata.id ?? `s-${i}`} data={s} />
        ))
      )}
    </p>
  );
};

export const Section = ({
  data,
  offset = 0,
  interval,
  BlockWrapper,
  SelectedBlocksWrapper,
  SelectionWrapper,
}: {
  data: Clip;
  offset?: number;
  interval?: [number, number] | null | undefined;
  BlockWrapper: ElementType;
  SelectedBlocksWrapper: ElementType;
  SelectionWrapper: ElementType;
}) => {
  const getItemStyle = (
    isDragging: boolean,
    draggableStyle: CSSProperties
  ): CSSProperties => ({
    userSelect: "none",
    background: isDragging ? "lightgreen" : "transparent",
    ...draggableStyle,
  });

  console.log({ data });

  const start = data.source_range.start_time;
  const end = data.source_range.duration + start;
  const adjustedInterval =
    interval &&
    ([interval[0] - offset, interval[1] - offset] as [number, number]);

  const attrs = Object.keys(data.metadata.data).reduce((acc, key) => {
    return {
      ...acc,
      [`data-${key.replaceAll("_", "-")}`]: data.metadata.data[key],
    } as Record<string, string>;
  }, {}) as unknown as Record<string, string>;

  const children = data?.children?.filter(
    (c: Clip) => c.OTIO_SCHEMA === "Clip.1"
  );

  let before: Clip[] = [];
  let selected: Clip[] = [];
  let after: Clip[] = [];
  let intersects = false;

  if (adjustedInterval && intersection([start, end], adjustedInterval)) {
    intersects = true;
    // attrs.style = { backgroundColor: "lightblue" };

    before = children.filter(
      (p: Clip) =>
        p.source_range.start_time + p.source_range.duration <
        adjustedInterval[0]
    );

    after = children.filter(
      (p: Clip) => p.source_range.start_time > adjustedInterval[1]
    );

    selected = children.filter((p: Clip) => {
      const pStart = p.source_range.start_time;
      const pEnd = pStart + p.source_range.duration;
      return intersection([pStart, pEnd], adjustedInterval);
    });
    // console.log({ before, selected, after });
  }

  return (
    <section {...attrs} id={data.metadata.id}>
      {intersects ? (
        <>
          {before.map((p: Clip, i: number) => (
            <BlockWrapper>
              <Paragraph key={p.metadata.id ?? `p-${i}`} data={p} />
            </BlockWrapper>
          ))}

          <Draggable draggableId="selection" index={0}>
            {(provided, snapshot) => (
              <>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={getItemStyle(
                    snapshot.isDragging,
                    provided.draggableProps.style as CSSProperties
                  )}
                >
                  <SelectedBlocksWrapper>
                    {selected.map((p: Clip, i: number) => (
                      <BlockWrapper>
                        <Paragraph
                          key={p.metadata.id ?? `p-${i}`}
                          data={p}
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
                      style={getItemStyle(
                        true,
                        provided.draggableProps.style as CSSProperties
                      )}
                    >
                      <SelectedBlocksWrapper>
                        {selected.map((p: Clip, i: number) => (
                          <BlockWrapper>
                            <Paragraph
                              key={p.metadata.id ?? `p-${i}`}
                              data={p}
                            />
                          </BlockWrapper>
                        ))}
                      </SelectedBlocksWrapper>
                    </div>
                  </>
                )}
              </>
            )}
          </Draggable>

          {after.map((p: Clip, i: number) => (
            <BlockWrapper>
              <Paragraph key={p.metadata.id ?? `p-${i}`} data={p} />
            </BlockWrapper>
          ))}
        </>
      ) : (
        children.map((p: Clip, i: number) => (
          <BlockWrapper>
            <Paragraph key={p.metadata.id ?? `p-${i}`} data={p} />
          </BlockWrapper>
        ))
      )}
    </section>
  );
};
