/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useMemo, useState, useCallback, ElementType, CSSProperties, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';

import { PlainDiv, PlainSpan, Section } from './components';
import { Context } from './RemixContext';
import { Player } from './Player';
import type { Timeline, Stack } from './interfaces';

import { timelineStacks } from './utils';

interface RemixSourceProps {
  PlayerWrapper?: ElementType;
  SourceWrapper?: ElementType;
  BlockWrapper?: ElementType;
  SelectedBlocksWrapper?: ElementType;
  SelectionWrapper?: ElementType;
  ToolbarWrapper?: ElementType;
  source: Timeline;
  active: boolean;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any[] | undefined;
  timestamp?: number;
}

const RemixSource = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  SourceWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SelectedBlocksWrapper = PlainDiv as unknown as ElementType,
  SelectionWrapper = PlainSpan as unknown as ElementType,
  // ToolbarWrapper = PlainDiv as unknown as ElementType,
  source,
  active,
  index,
  // tools = [],
  timestamp = 0,
}: RemixSourceProps): JSX.Element => {
  const { state } = useContext(Context);
  const { poster, width, height } = state;

  const stacks: Stack[] = useMemo(() => timelineStacks(source), [source]);

  const offsets = useMemo(() => {
    let cumulativeOffset = 0;
    return stacks.map((stack) => {
      const offset = cumulativeOffset;
      cumulativeOffset += stack.source_range?.duration ?? 0;
      return offset;
    });
  }, [stacks]);

  const getListStyle = (isDraggingOver: boolean): CSSProperties => ({
    background: isDraggingOver ? 'lightyellow' : 'transparent',
    width: '100%',
  });

  const [interval, setInterval] = useState<[number, number] | null>(null);

  useEffect(() => setInterval(null), [timestamp]);

  const handleSourceClick = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setInterval(null);
      return;
    }

    const range = selection.getRangeAt(0);
    console.log(range);

    const start =
      range.startContainer.parentElement?.nodeName === 'SPAN'
        ? range.startContainer.parentElement
        : (range.startContainer as any).nextElementSibling;
    let end =
      range.endContainer.parentElement?.nodeName === 'SPAN'
        ? range.endContainer.parentElement
        : (range.endContainer as any).previousElementSibling;

    console.log(start, end);

    // TODO handle space selection, <p>...

    // find root article
    const article = start?.closest('article');
    if (!article) return;

    // find parent section
    const section = start?.closest('section');
    if (!section) return;

    // find section's offset in article
    const sections = Array.from(article?.querySelectorAll('section') ?? []); // TODO use proper selector?
    const sectionIndex = sections.indexOf(section);
    const previousSections = sections.slice(0, sectionIndex);
    const durations = previousSections.map((s) => {
      const [start, end] = ((s as Element).getAttribute('data-t') ?? '0,0').split(',');
      const duration = parseFloat(end) - parseFloat(start);
      return duration < 0 ? 0 : duration;
    });
    const offset = durations.reduce((acc, d) => acc + d, 0);

    // const startNode = start?.nodeName === 'SPAN' ? start : start?.nextElementSibling;
    // const endNode = end?.nodeName === 'SPAN' ? end : end?.previousElementSibling;
    // find start and end time
    if (start?.nodeName === 'SPAN' && end?.nodeName === 'SPAN') {
      const [startT] = (start.getAttribute('data-t') ?? '0,0').split(',').map(parseFloat);
      const [, endT] = (end.getAttribute('data-t') ?? '0,0').split(',').map(parseFloat);

      const selectionInterval = [startT + offset, endT + offset] as [number, number];

      setInterval(selectionInterval as [number, number]);
      selection.removeAllRanges();
    } else if (start?.nodeName === 'SPAN' && range.endContainer?.nodeName === 'P') {
      end = range.endContainer;
      const [startT] = (start.getAttribute('data-t') ?? '0,0').split(',').map(parseFloat);
      const [startP] = (end.getAttribute('data-t') ?? '0,0').split(',').map(parseFloat);

      const selectionInterval = [startT + offset, startP + offset] as [number, number];

      setInterval(selectionInterval as [number, number]);
      selection.removeAllRanges();
    } else {
      console.log('Invalid selection:', start?.nodeName, end?.nodeName, start, end);
    }
  }, []);

  const droppableId = useMemo(
    () => `Source-${index}-${interval ? interval?.[0] : 0}-${interval ? interval?.[1] : 0}`,
    [index, interval],
  );

  // const offsets = useMemo(
  //   () =>
  //     stacks.map((_stack: Stack, i) => stacks.slice(0, i).reduce((acc, s) => acc + (s.source_range?.duration ?? 0), 0)),
  //   [stacks],
  // );

  return (
    <div style={{ display: active ? 'block' : 'none' }} data-sid={(source?.metadata as any)?.id ?? 'SID'}>
      <PlayerWrapper>
        <Player transcript={`#A${source?.metadata?.id}`} pauseMutationObserver={true} {...{ poster, width, height }} />
      </PlayerWrapper>

      {/* <ToolbarWrapper>{tools.map((tool) => tool.toolBarComponent)}</ToolbarWrapper> */}
      <SourceWrapper>
        <Droppable
          droppableId={droppableId}
          // type="BLOCK"
          isDropDisabled={true}
        >
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={getListStyle(snapshot.isDraggingOver)}
              onClick={handleSourceClick}
            >
              <article id={'A' + source?.metadata?.id} data-sid={(source?.metadata as any)?.sid}>
                {stacks.map((stack: Stack, i) => (
                  <Section
                    key={stack?.metadata?.id ?? `S${i}`}
                    stack={stack}
                    offset={offsets[i]}
                    interval={interval}
                    sourceId={(source?.metadata as any)?.sid}
                    droppableId={droppableId}
                    source={source}
                    {...{
                      BlockWrapper,
                      SelectedBlocksWrapper,
                      SelectionWrapper,
                    }}
                  />
                ))}
              </article>

              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </SourceWrapper>
    </div>
  );
};

export default RemixSource;
