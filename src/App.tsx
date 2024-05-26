/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useReducer, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { intersection, difference } from 'interval-operations';

import { AppBar, Box, IconButton, Grid, Tab, Tabs, Toolbar, Typography, CssBaseline } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';

// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

import {
  MediaController,
  MediaControlBar,
  MediaTimeRange,
  MediaTimeDisplay,
  MediaVolumeRange,
  MediaPlayButton,
  MediaDurationDisplay,
  MediaCaptionsButton,
  MediaMuteButton,
} from 'media-chrome/dist/react';
import { createComponent } from '@lit/react';
import { TimedTextPlayer } from '../../timedtext-player/dist/timedtext-player.js';

import track from './data/test.json';

import './App.css';

const TimedTextPlayerComponent = createComponent({
  tagName: 'timedtext-player',
  elementClass: TimedTextPlayer,
  react: React,
  events: {
    onactivate: 'activate',
    onchange: 'change',
  },
});

interface Block {
  id: string;
  data: any; // Replace 'any' with a more specific type if possible
  metadata: any; // Replace 'any' with a more specific type if possible
}

type State = Block[];

type Action = { type: 'move'; payload: DropResult } | { type: 'add'; payload: [DropResult, Block] };
// | { type: "remove"; payload: { id: string } }
// | { type: "update"; payload: Block };

const emptyState: State = [];

interface TabPanelProps {
  children?: React.ReactNode;
  index: any;
  value: any;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const getItemStyle = (isDragging, draggableStyle) => ({
  // some basic styles to make the items look a bit nicer
  userSelect: 'none',
  // padding: 8 * 2,
  // margin: `0 0 ${grid}px 0`,

  // change background colour if dragging
  background: isDragging ? 'lightgreen' : 'transparent',

  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? 'lightyellow' : 'transparent',
  // padding: 8,
  width: '100%',
});

function App() {
  const [showPlayer, setShowPlayer] = useState(false);

  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  const [sources, setSources] = useState<Block[][]>([track2blocks(track)]);
  const [blocks, dispatch] = useReducer(blockReducer, track2blocks(track) ?? emptyState);

  const [block, setBlock] = useState<Block | null>(null);
  const [interval, setInterval] = useState<[number, number] | null>(null);
  const [interval2, setInterval2] = useState<[number, number] | null>(null);

  // useEffect(() => {
  //   const listener = (e: any) => {
  //     console.log(e, document.getSelection());
  //   };

  //   document.addEventListener("selectionchange", listener);
  //   return () => document.removeEventListener("selectionchange", listener);
  // }, []);

  const handleSourceClick = useCallback(
    (e: React.MouseEvent) => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;

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

        const selectionInterval = [startT + offset, endT + offset] as [number, number]; // TODO trim to section interval (no selection outside of section)

        setInterval(selectionInterval);
        setInterval2([startT, endT] as [number, number]); // FIXME use block.id + interval on source media only
        const block = sources[0].find((b) => b.id === section.getAttribute('id')) ?? null;
        setBlock(block);
        console.log({ section, block, selectionInterval });
      }
    },
    [sources],
  );

  const handleLeftDrawerToggle = () => {
    setLeftDrawerOpen(!leftDrawerOpen);
  };

  const handleRightDrawerToggle = () => {
    setRightDrawerOpen(!rightDrawerOpen);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const onDragEnd = (result: DropResult) => {
    console.log({ result });
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.source.droppableId === result.destination.droppableId && result.source.droppableId === 'droppable') {
      dispatch({ type: 'move', payload: result });
      return;
    }

    if (result.source.droppableId === 'droppable0') {
      console.log({ result, block, interval2 });
      if (!block) return;

      const _block = trimBlock(block, interval2);
      dispatch({ type: 'add', payload: [result, _block] });
      return;
    }
  };

  const width = 720;
  const height = 480;
  const aspectRatio = '16/9';

  return (
    <Box
      sx={{
        flexGrow: 1,
        border: '1px solid grey',
        // borderRadius: 2,
        overflow: 'hidden',
        width: 2 * width + 0,
      }}
    >
      <AppBar position="static" color="transparent">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleLeftDrawerToggle}
            sx={{ mr: 2 }}
            size="large"
          >
            {leftDrawerOpen ? <ChevronRightIcon /> : <SearchIcon />}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Remixer
          </Typography>
          <IconButton color="inherit" aria-label="open right drawer" onClick={handleRightDrawerToggle} size="large">
            {rightDrawerOpen ? <ChevronLeftIcon /> : <TuneIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <DragDropContext onDragEnd={onDragEnd}>
        <Box display="flex" flexGrow={1}>
          {leftDrawerOpen && (
            <Box width={240} flexShrink={0}>
              searchbox/etc.
            </Box>
          )}
          <Box flex={1} display="flex" flexDirection="column" onClick={handleSourceClick} style={{ width: width }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 0 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabbed content">
                <Tab label="Transcript One" />
                <Tab label="Transcript Two" />
                <Tab label="Transcript Three" />
              </Tabs>
            </Box>
            {/* <TabPanel value={tabValue} index={0}> */}
            <div
              style={{
                width: width,
                height: height,
                aspectRatio: aspectRatio,
                backgroundColor: 'black',
              }}
            >
              <p>PLAYER</p>
            </div>
            <Box
              sx={{
                overflowY: 'auto',
                height: 'calc(100vh - 64px)',
                width: width,
                padding: 0,
              }}
            >
              <Droppable
                droppableId="droppable0"
                // type="BLOCK"
                isDropDisabled={true}
              >
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                  >
                    <article>
                      {sources[0].map((block, i, blocks) => (
                        <Section
                          key={block.id}
                          data={block.data}
                          id={block.id}
                          offset={blocks.slice(0, i).reduce((acc, b) => acc + (b.data?.source_range?.duration ?? 0), 0)}
                          interval={interval}
                        />
                      ))}
                    </article>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Box>
            {/* </TabPanel> */}
          </Box>
          <Box flex={1}>
            {/* <CssBaseline /> */}
            <div
              style={{
                width: width,
                height: height,
                aspectRatio: aspectRatio,
                backgroundColor: 'black',
                marginTop: 49,
              }}
            >
              {showPlayer ? (
                <MediaController id="myController">
                  <MediaControlBar style={{ width: '100%' }}>
                    <MediaPlayButton></MediaPlayButton>
                    <MediaMuteButton></MediaMuteButton>
                    <MediaVolumeRange></MediaVolumeRange>
                    <MediaTimeDisplay></MediaTimeDisplay>
                    <MediaTimeRange></MediaTimeRange>
                    <MediaDurationDisplay></MediaDurationDisplay>
                    <MediaCaptionsButton></MediaCaptionsButton>
                  </MediaControlBar>

                  <TimedTextPlayerComponent
                    slot="media"
                    width={width}
                    height={height}
                    // transcript="#transcript"
                    player="#video1"
                  ></TimedTextPlayerComponent>
                </MediaController>
              ) : (
                <button onClick={() => setShowPlayer(true)}>Show Player</button>
              )}
            </div>
            <Box sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
              {/* <DragDropContext onDragEnd={onDragEnd}> */}
              <article id="transcript">
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {blocks.map((block, index) => (
                        <Draggable key={block.id} draggableId={block.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                            >
                              <Section data={block.data} id={block.id} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </article>
              {/* </DragDropContext> */}
            </Box>
          </Box>
          {rightDrawerOpen && (
            <Box width={240} flexShrink={0}>
              debug/info/etc.
            </Box>
          )}
        </Box>
      </DragDropContext>
    </Box>
  );
}

function Section({
  id,
  data,
  offset = 0,
  interval,
}: {
  id: string;
  data: any;
  offset?: number;
  interval?: [number, number];
}) {
  const start = data.source_range.start_time;
  const end = data.source_range.duration + start;
  const adjustedInterval = interval && ([interval[0] - offset, interval[1] - offset] as [number, number]);

  const attrs = Object.keys(data.metadata.data).reduce(
    (acc, key) => {
      return {
        ...acc,
        [`data-${key.replaceAll('_', '-')}`]: data.metadata.data[key],
      };
    },
    { id },
  );

  const children = data?.children?.filter((c) => c.OTIO_SCHEMA === 'Clip.1');
  let before = [];
  let selected = [];
  let after = [];
  let intersects = false;

  if (adjustedInterval && intersection([start, end], adjustedInterval)) {
    intersects = true;
    attrs.style = { backgroundColor: 'lightblue' };

    before = children.filter((p) => p.source_range.start_time + p.source_range.duration < adjustedInterval[0]);
    after = children.filter((p) => p.source_range.start_time > adjustedInterval[1]);
    selected = children.filter((p) => {
      const pStart = p.source_range.start_time;
      const pEnd = pStart + p.source_range.duration;
      return intersection([pStart, pEnd], adjustedInterval);
    });
    // console.log({ before, selected, after });
  }

  return (
    <section {...attrs}>
      {intersects ? (
        <>
          {before.map((p, i) => (
            <Paragraph key={`p${i}`} data={p} />
          ))}

          <Draggable draggableId="selection" index={0}>
            {(provided, snapshot) => (
              <>
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
                >
                  {selected.map((p, i) => (
                    <Paragraph
                      key={`p${i}`}
                      data={p}
                      interval={adjustedInterval}
                      dragHandleProps={provided.dragHandleProps}
                      isDragging={snapshot.isDragging}
                    />
                  ))}
                </div>
                {snapshot.isDragging && (
                  <>
                    <div style={getItemStyle(provided.draggableProps.style)}>
                      {selected.map((p, i) => (
                        <Paragraph key={`p${i}`} data={p} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </Draggable>

          {after.map((p, i) => (
            <Paragraph key={`p${i}`} data={p} />
          ))}
        </>
      ) : (
        children.map((p, i) => <Paragraph key={`p${i}`} data={p} />)
      )}
    </section>
  );
}

function Paragraph({
  data,
  interval,
  dragHandleProps,
  isDragging,
}: {
  data: any;
  interval?: [number, number];
  dragHandleProps?: any;
  isDragging?: boolean;
}) {
  const start = data.source_range.start_time;
  const end = data.source_range.duration + start;

  const attrs = Object.keys(data?.metadata?.data ?? {}).reduce((acc, key) => {
    if (!key) return acc;
    return {
      ...acc,
      [`data-${key.replaceAll('_', '-')}`]: data.metadata.data[key],
    };
  }, {});

  const children = data?.timed_texts ?? [];
  let before = [];
  let selected = [];
  let after = [];
  let intersects = false;

  if (interval && intersection([start, end], interval)) {
    intersects = true;
    attrs.style = { backgroundColor: 'lightyellow' };

    before = children.filter((p) => p.marked_range.start_time + p.marked_range.duration < interval[0]);
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
          {dragHandleProps && isDragging ? null : before.map((s, i) => <Span key={`s${i}`} data={s} />)}
          <span className="selection" {...dragHandleProps}>
            {selected.map((s, i) => (
              <Span key={`s${i}`} data={s} />
            ))}
          </span>
          {dragHandleProps && isDragging ? null : after.map((s, i) => <Span key={`s${i}`} data={s} />)}
        </>
      ) : (
        children.map((s, i) => <Span key={`s${i}`} data={s} />)
      )}
    </p>
  );
}

function Span({ data }: { data: any }) {
  // const attrs = Object.keys(data?.metadata?.data ?? {}).reduce((acc, key) => {
  //   if (!key) return acc;
  //   return {
  //     ...acc,
  //     [`data-${key.replaceAll("_", "-")}`]: data.metadata.data[key],
  //   };
  // }, {});
  const start = data.marked_range.start_time;
  const end = data.marked_range.duration + start;
  return (
    <>
      <span data-t={`${start},${end}`}>{data.texts}</span>{' '}
    </>
  );
}

function blockReducer(state: State, action: Action): State {
  switch (action.type) {
    // case "add":
    //   // Prevent adding a block with a duplicate ID
    //   if (state.find((block) => block.id === action.payload.id)) {
    //     console.warn("Block with this ID already exists.");
    //     return state;
    //   }
    //   return [...state, action.payload];

    // case "remove":
    //   return state.filter((block) => block.id !== action.payload.id);

    // case "update":
    //   return state.map((block) =>
    //     block.id === action.payload.id ? { ...block, ...action.payload } : block
    //   );

    case 'add': {
      const [result, block] = action.payload;
      const { source, destination } = result;
      const resultState = [...state];
      // const [removed] = resultState.splice(source.index, 1);
      resultState.splice(destination.index, 0, block);
      return resultState;
    }

    case 'move': {
      const { source, destination } = action.payload;
      const result = [...state];
      const [removed] = result.splice(source.index, 1);
      result.splice(destination.index, 0, removed);
      return result;
    }

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function track2blocks(track: any): State {
  if (!track) return [];

  return track.children.map((section: any) => {
    return {
      id: section?.metadata?.id ?? nanoid(), // TODO use urlAlphabet
      data: section,
      metadata: section?.metadata ?? {},
    };
  });
}

function trimBlock(block: Block, interval: [number, number]): Block {
  const { data, metadata } = block;
  const { children } = data;
  const start = data.source_range.start_time;
  const end = data.source_range.duration + start;

  const trimmedChildren = children
    .filter((child) => {
      const childStart = child.source_range.start_time;
      const childEnd = child.source_range.duration + childStart;
      return intersection([childStart, childEnd], interval);
    })
    .map((child) => {
      // trim timed_texts
      const { timed_texts } = child;
      const trimmedTexts = timed_texts.filter((text) => {
        const textStart = text.marked_range.start_time;
        const textEnd = text.marked_range.duration + textStart;
        return intersection([textStart, textEnd], interval);
      });
      return {
        ...child,
        timed_texts: trimmedTexts,
      };
    });

  return {
    id: nanoid(),
    data: {
      ...data,
      source_range: {
        start_time: interval[0],
        duration: interval[1] - interval[0],
      },
      children: trimmedChildren,
    },
    metadata, // TODO fix data-t
  };
}

export default App;
