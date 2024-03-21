/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";

import {
  AppBar,
  Box,
  IconButton,
  Grid,
  Tab,
  Tabs,
  Toolbar,
  Typography,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

// import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

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
} from "media-chrome/dist/react";
import { createComponent } from "@lit/react";
import { TimedTextPlayer } from "../../timedtext-player/dist/timedtext-player.js";

import track from "./data/test.json";

import "./App.css";

const TimedTextPlayerComponent = createComponent({
  tagName: "timedtext-player",
  elementClass: TimedTextPlayer,
  react: React,
  events: {
    onactivate: "activate",
    onchange: "change",
  },
});

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

function App() {
  const [showPlayer, setShowPlayer] = useState(false);

  const [leftDrawerOpen, setLeftDrawerOpen] = React.useState(false);
  const [rightDrawerOpen, setRightDrawerOpen] = React.useState(false);
  const [tabValue, setTabValue] = React.useState(0);

  const handleLeftDrawerToggle = () => {
    setLeftDrawerOpen(!leftDrawerOpen);
  };

  const handleRightDrawerToggle = () => {
    setRightDrawerOpen(!rightDrawerOpen);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const [sections, setSections] = useState(track.children);

  const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: 8 * 2,
    // margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle,
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: 8,
    width: "100%",
  });

  const onDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const reorder = (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      return result;
    };

    const items = reorder(
      sections,
      result.source.index,
      result.destination.index
    );

    setSections(items);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        border: "1px solid grey",
        borderRadius: 2,
        overflow: "hidden",
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
          <IconButton
            color="inherit"
            aria-label="open right drawer"
            onClick={handleRightDrawerToggle}
            size="large"
          >
            {rightDrawerOpen ? <ChevronLeftIcon /> : <TuneIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box display="flex" flexGrow={1}>
        {leftDrawerOpen && (
          <Box width={240} flexShrink={0}>
            searchbox/etc.
          </Box>
        )}
        <Box flex={1} display="flex" flexDirection="column">
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="tabbed content"
            >
              <Tab label="Transcript One" />
              <Tab label="Transcript Two" />
              <Tab label="Transcript Three" />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            Transcript One Content
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            Transcript Two Content
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            Transcript Three Content
          </TabPanel>
        </Box>
        <Box flex={1}>
          <div>
            {showPlayer ? (
              <MediaController id="myController">
                <MediaControlBar style={{ width: "100%" }}>
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
                  // transcript="#transcript"
                  player="#video1"
                  width={320}
                ></TimedTextPlayerComponent>
              </MediaController>
            ) : (
              <button onClick={() => setShowPlayer(true)}>Show Player</button>
            )}
          </div>
          <div>
            <DragDropContext onDragEnd={onDragEnd}>
              <article id="transcript">
                <Droppable droppableId="droppable">
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={getListStyle(snapshot.isDraggingOver)}
                    >
                      {sections.map((section, index) => (
                        <Draggable
                          key={`i${index}`}
                          draggableId={`id${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(
                                snapshot.isDragging,
                                provided.draggableProps.style
                              )}
                            >
                              <Section data={section} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </article>
            </DragDropContext>
          </div>
        </Box>
        {rightDrawerOpen && (
          <Box width={240} flexShrink={0}>
            debug/info/etc.
          </Box>
        )}
      </Box>
    </Box>
  );
}

function Section({ data }: { data: any }) {
  const attrs = Object.keys(data.metadata.data).reduce((acc, key) => {
    return {
      ...acc,
      [`data-${key.replaceAll("_", "-")}`]: data.metadata.data[key],
    };
  }, {});
  return (
    <section {...attrs}>
      {data?.children
        ?.filter((c) => c.OTIO_SCHEMA === "Clip.1")
        .map((p, i) => <Paragraph key={`p${i}`} data={p} />)}
    </section>
  );
}

function Paragraph({ data }: { data: any }) {
  const attrs = Object.keys(data?.metadata?.data ?? {}).reduce((acc, key) => {
    if (!key) return acc;
    return {
      ...acc,
      [`data-${key.replaceAll("_", "-")}`]: data.metadata.data[key],
    };
  }, {});
  return (
    <p {...attrs}>
      {data?.timed_texts?.map((s, i) => <Span key={`s${i}`} data={s} />)}
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
      <span data-t={`${start},${end}`}>{data.texts}</span>{" "}
    </>
  );
}

export default App;
