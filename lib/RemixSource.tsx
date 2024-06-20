import { useMemo, useState, useCallback, ElementType, CSSProperties } from 'react';
import { Droppable } from '@hello-pangea/dnd';

import { PlainDiv, PlainSpan, Section } from './components';
import { Player } from './Player';
import type { Timeline, Stack } from './interfaces';

import { timelineStacks } from './utils';

interface RemixSourceProps {
  PlayerWrapper?: ElementType;
  SourceWrapper?: ElementType;
  BlockWrapper?: ElementType;
  SelectedBlocksWrapper?: ElementType;
  SelectionWrapper?: ElementType;
  source: Timeline;
  active: boolean;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools: any[] | undefined;
}

const RemixSource = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  SourceWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SelectedBlocksWrapper = PlainDiv as unknown as ElementType,
  SelectionWrapper = PlainSpan as unknown as ElementType,
  source,
  active,
  index,
  tools = [],
}: RemixSourceProps): JSX.Element => {
  const stacks: Stack[] = useMemo(() => {
    // if (source.tracks.children[0].children.every((c) => c.OTIO_SCHEMA === 'Clip.1')) {
    //   return [source.tracks] as Stack[];
    // } else {
    //   return source.tracks.children.flatMap((t) => t.children as Stack[]) as Stack[];
    // }
    return timelineStacks(source);
  }, [source]);

  const getListStyle = (isDraggingOver: boolean): CSSProperties => ({
    background: isDraggingOver ? 'lightyellow' : 'transparent',
    width: '100%',
  });

  const [interval, setInterval] = useState<[number, number] | null>(null);

  const handleSourceClick = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setInterval(null);
      return;
    }

    const range = selection.getRangeAt(0);
    console.log(range);
    const start = range.startContainer.parentElement;
    const end = range.endContainer.parentElement;
    console.log(start, end);

    // TODO handle space selection, <p>...

    // find root article
    const article = start?.closest('article');
    if (!article) return;

    // find parent section
    const section = start?.closest('section');
    if (!section) return;

    // find section's offset in article
    const sections = Array.from(article?.querySelectorAll('section') ?? []); // TODO use proper selector
    const sectionIndex = sections.indexOf(section);
    const previousSections = sections.slice(0, sectionIndex);
    const durations = previousSections.map((s) => {
      const [start, end] = (s.getAttribute('data-t') ?? '0,0').split(',');
      return parseFloat(end) - parseFloat(start) ?? 0;
    });
    const offset = durations.reduce((acc, d) => acc + d, 0);

    // find start and end time
    if (start?.nodeName === 'SPAN' && end?.nodeName === 'SPAN') {
      const [startT] = (start.getAttribute('data-t') ?? '0,0').split(',').map(parseFloat);
      const [, endT] = (end.getAttribute('data-t') ?? '0,0').split(',').map(parseFloat);

      const selectionInterval = [startT + offset, endT + offset] as [number, number]; // TODO TBD trim to section interval (no selection outside of section)

      setInterval(selectionInterval as [number, number]);
      selection.removeAllRanges(); // TODO TBD this breaks Hypothes.is
    }
  }, []);

  return (
    <div style={{ display: active ? 'block' : 'none' }} data-sid={source?.metadata?.sid ?? 'SID'}>
      <PlayerWrapper>
        <Player transcript={`#A${source?.metadata?.id}`} pauseMutationObserver={true} />
      </PlayerWrapper>
      {/* <p>
        Interval: {interval ? interval[0] : 0} - {interval ? interval[1] : 0}
      </p> */}
      <SourceWrapper>
        <Droppable
          droppableId={`Source-${index}-${interval ? interval[0] : 0}-${interval ? interval[1] : 0}`}
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
              <article id={'A' + source?.metadata?.id} data-sid={source?.metadata?.sid}>
                {stacks.map((stack: Stack, i, stacks) => (
                  <Section
                    key={stack?.metadata?.id ?? `S${i}`}
                    stack={stack}
                    offset={stacks.slice(0, i).reduce((acc, s) => acc + (s.source_range?.duration ?? 0), 0)}
                    interval={interval}
                    sourceId={source?.metadata?.sid}
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
