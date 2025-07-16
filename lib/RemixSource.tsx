/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext, useMemo, useState, useCallback, ElementType, CSSProperties, useEffect, useRef } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import { TimedTextPlayer } from '@theirstoryinc/timedtext-player/dist/timedtext-player.js';

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
  SearchTool?: ElementType;
  source: Timeline;
  active: boolean;
  index: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tools?: any[] | undefined;
  timestamp?: number;
  isDragDisabled?: boolean;
}

const RemixSource = ({
  PlayerWrapper = PlainDiv as unknown as ElementType,
  SourceWrapper = PlainDiv as unknown as ElementType,
  BlockWrapper = PlainDiv as unknown as ElementType,
  SelectedBlocksWrapper = PlainDiv as unknown as ElementType,
  SelectionWrapper = PlainSpan as unknown as ElementType,
  ToolbarWrapper = PlainDiv as unknown as ElementType,
  SearchTool = PlainDiv as unknown as ElementType,
  source,
  active,
  index,
  // tools = [],
  timestamp = 0,
  isDragDisabled = false,
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
    if (isDragDisabled) return;

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
  }, [isDragDisabled]);

  const droppableId = useMemo(
    () => `Source-${index}-${interval ? interval?.[0] : 0}-${interval ? interval?.[1] : 0}`,
    [index, interval],
  );

  // const offsets = useMemo(
  //   () =>
  //     stacks.map((_stack: Stack, i) => stacks.slice(0, i).reduce((acc, s) => acc + (s.source_range?.duration ?? 0), 0)),
  //   [stacks],
  // );

  const ref = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TimedTextPlayer | undefined>();
  useEffect(() => {
    playerRef.current = ref.current?.querySelector('timedtext-player') as TimedTextPlayer;
  }, [ref, playerRef]);

  const sid = useMemo(() => (source?.metadata as any)?.id ?? 'SID', [source]);

  const [searchText, setSearchText] = useState('');
  const [searchResultsCount, setSearchResultsCount] = useState(0);
  const [searchIndex, setSearchIndex] = useState(0);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    setSearchIndex(0);
  }, []);

  useEffect(() => {
    const str = searchText.trim().toLowerCase();
    if (str.length <= 1) {
      CSS.highlights.delete(`search-results-${sid}`);
      CSS.highlights.delete(`search-results-head-${sid}`);
      setSearchIndex(0);
      setSearchResultsCount(0);
      return;
    }

    const article = ref.current?.querySelector('article');
    console.log({ref, article});
    if (!article) return;

    const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
    const allTextNodes = [];
    let currentNode = treeWalker.nextNode();
    while (currentNode) {
      allTextNodes.push(currentNode);
      currentNode = treeWalker.nextNode();
    }
    console.log({allTextNodes});

    if (!CSS.highlights) {
      alert("CSS Custom Highlight API not supported.");
      return;
    }

    CSS.highlights.delete(`search-results-${sid}`);
    CSS.highlights.delete(`search-results-head-${sid}`);

    // Build a map of text positions to their corresponding text nodes
    const textNodeMap: Array<{ node: Node; start: number; end: number; text: string }> = [];
    let concatenatedText = '';

    allTextNodes.forEach((node) => {
      const nodeText = node.textContent?.toLowerCase() ?? '';
      const start = concatenatedText.length;
      const end = start + nodeText.length;

      textNodeMap.push({
        node,
        start,
        end,
        text: nodeText
      });

      concatenatedText += nodeText;
    });

    // Find all matches in the concatenated text
    const matchIndices: number[] = [];
    let startPos = 0;
    while (startPos < concatenatedText.length) {
      const index = concatenatedText.indexOf(str, startPos);
      if (index === -1) break;
      matchIndices.push(index);
      startPos = index + 1; // Move by 1 to find overlapping matches
    }

    // Map matches back to DOM ranges
    const ranges = matchIndices.map((matchStart) => {
      const matchEnd = matchStart + str.length;

      // Find the text nodes that contain the start and end of the match
      const startNodeInfo = textNodeMap.find(info => matchStart >= info.start && matchStart < info.end);
      const endNodeInfo = textNodeMap.find(info => matchEnd > info.start && matchEnd <= info.end);

      if (!startNodeInfo || !endNodeInfo) return null;

      const range = new Range();

      // Set the start position
      const startOffset = matchStart - startNodeInfo.start;
      range.setStart(startNodeInfo.node, startOffset);

      // Set the end position
      const endOffset = matchEnd - endNodeInfo.start;
      range.setEnd(endNodeInfo.node, endOffset);

      return range;
    }).filter(range => range !== null) as Range[];

    // console.log({ranges});
    setSearchResultsCount(ranges.flat().length);

    // Create a Highlight object for the ranges.
    let searchResultsHighlight = new Highlight(...ranges.flat());
    console.log({searchResultsHighlight});
    // highlights minus the one at searchIndex
    const highlights = ranges.flat().filter((_range, index) => index !== searchIndex);
    searchResultsHighlight = new Highlight(...highlights);

    // Register the Highlight object in the registry.
    CSS.highlights.set(`search-results-${sid}`, searchResultsHighlight);

    // highlight the result at index
    const rangeAtIndex = (ranges.flat())[searchIndex];
    console.log({rangeAtIndex});
    if (rangeAtIndex) {
      const highlight = new Highlight(rangeAtIndex);
      CSS.highlights.set(`search-results-head-${sid}`, highlight);
      // find dom node for range
      const domNode = rangeAtIndex.startContainer.parentElement;
      console.log({domNode});
      if (domNode) {
        domNode.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [searchText, searchIndex, sid]);

  const handlePrevious = useCallback(() => {
    setSearchIndex(searchIndex - 1 < 0 ? searchResultsCount - 1 : searchIndex - 1);
  }, [searchIndex, searchResultsCount]);
  const handleNext = useCallback(() => {
    setSearchIndex(searchIndex + 1 >= searchResultsCount ? 0 : searchIndex + 1 );
  }, [searchIndex, searchResultsCount]);


  return (
    <div ref={ref} style={{ display: active ? 'block' : 'none' }} data-sid={sid}>
      <PlayerWrapper>
        <Player transcript={`#A${source?.metadata?.id}`} pauseMutationObserver={true} {...{ poster, width, height }} />
      </PlayerWrapper>

      <ToolbarWrapper>
        <SearchTool postfix={sid} searchText={searchText} searchIndex={searchIndex} searchResultsCount={searchResultsCount} handleSearchChange={handleSearchChange} handlePrevious={handlePrevious} handleNext={handleNext} />
      </ToolbarWrapper>

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
                    playerRef={playerRef}
                    isDragDisabled={isDragDisabled}
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
