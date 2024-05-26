/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useReducer, useCallback, useMemo } from 'react';
import { Box, Tab, Tabs } from '@mui/material';

// import { DragDropContext, DropResult } from "@hello-pangea/dnd";

import RemixContext from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { ts2timeline } from '../lib/utils.js';
import type { Timeline } from '../lib/interfaces';

// import track from "./data/test.json";
import A from './data/A.json';
import B from './data/B.json';
import C from './data/C.json';
import E from './data/E.json';

import './App.css';

// interface Block {
//   id: string;
//   data: any; // Replace 'any' with a more specific type if possible
//   metadata: any; // Replace 'any' with a more specific type if possible
// }

// type State = Block[];

// type Action =
//   | { type: "move"; payload: DropResult }
//   | { type: "add"; payload: [DropResult, Block] };
// // | { type: "remove"; payload: { id: string } }
// // | { type: "update"; payload: Block };

// const emptyState: State = [];

// interface TabPanelProps {
//   children?: React.ReactNode;
//   index: any;
//   value: any;
// }

// function TabPanel(props: TabPanelProps) {
//   const { children, value, index, ...other } = props;

//   return (
//     <div
//       role="tabpanel"
//       hidden={value !== index}
//       id={`simple-tabpanel-${index}`}
//       aria-labelledby={`simple-tab-${index}`}
//       {...other}
//     >
//       {value === index && (
//         <Box sx={{ p: 3 }}>
//           <Typography>{children}</Typography>
//         </Box>
//       )}
//     </div>
//   );
// }

function App() {
  const [tabValue, setTabValue] = React.useState(0);

  // const [sources, setSources] = useState<Clip[][]>([track2clips(track)]);
  // const [blocks, dispatch] = useReducer(
  //   blockReducer,
  //   track2blocks(track) ?? emptyState
  // );

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const width = 720;

  const sources = useMemo(() => [ts2timeline(A), ts2timeline(B), ts2timeline(C)] as Timeline[], []);
  const remix = useMemo(() => ts2timeline(E), []);

  return (
    <>
      <style>
        {`
          section::before {
            content: '§ 'attr(data-t)' + 'attr(data-offset)' 'attr(data-media-src);
            display: block;
            font-size: 0.8em;
            color: red;
          }
          p::before {
            content: '¶ 'attr(data-t);
            display: block;
            font-size: 0.8em;
            color: blue;
          }
        `}
      </style>
      <Box
        sx={{
          flexGrow: 1,
          border: '1px solid grey',
          overflow: 'hidden',
          width: 2 * width + 0,
        }}
      >
        <RemixContext sources={sources} remix={remix}>
          <Box display="flex" flexGrow={1}>
            <Box flex={1} display="flex" flexDirection="column" style={{ width: width }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 0 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabbed content">
                  <Tab label="Transcript One" />
                  <Tab label="Transcript Two" />
                  <Tab label="Transcript Three" />
                </Tabs>
              </Box>
              {/* <TabPanel value={tabValue} index={0}> */}
              <Box
                sx={{
                  overflowY: 'auto',
                  height: 'calc(100vh - 64px)',
                  width: width,
                  padding: 0,
                }}
              >
                <RemixSources />
              </Box>
              {/* </TabPanel> */}
            </Box>
            <Box flex={1}>
              <Box sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
                <RemixDestination />
              </Box>
            </Box>
          </Box>
        </RemixContext>
      </Box>
    </>
  );
}

// function track2clips(track: any): State {
//   if (!track) return [];

//   return track.children.map((section: any) => {
//     const metadata = section?.metadata ?? {};
//     if (!metadata.id) metadata.id = nanoid(); // TODO use urlAlphabet

//     return {
//       ...section,
//       metadata,
//     };
//   });
// }

// function ts2timeline(ts: any): Timeline {
//   const { words, paragraphs } = ts.transcript;
//   const duration = words[words.length - 1].end ?? ts.story.duration ?? 0;

//   const clips = paragraphs.map((p: any): Clip => {
//     const timedTexts = words
//       .filter((w: any) => p.start <= w.start && w.end <= p.end)
//       .map((w: any): TimedText => {
//         return {
//           OTIO_SCHEMA: "TimedText.1",
//           marked_range: {
//             OTIO_SCHEMA: "TimeRange.1",
//             start_time: w.start,
//             duration: w.end - w.start,
//           },
//           texts: w.text,
//         } as TimedText;
//       });

//     return {
//       OTIO_SCHEMA: "Clip.1",
//       metadata: {
//         speaker: p.speaker,
//       } as Metadata,
//       media_reference: {
//         OTIO_SCHEMA: "MediaReference.1",
//         target: ts.videoURL,
//       },
//       source_range: {
//         OTIO_SCHEMA: "TimeRange.1",
//         start_time: p.start,
//         duration: p.end - p.start,
//       } as TimeRange,
//       timed_texts: timedTexts as TimedText[],
//     };
//   });

//   const timeline: Timeline = {
//     OTIO_SCHEMA: "Timeline.1",
//     metadata: {
//       id: ts.transcript._id,
//       story: ts.story,
//       videoURL: ts.videoURL,
//     } as Metadata,
//     tracks: {
//       OTIO_SCHEMA: "Stack.1",
//       media_reference: {
//         OTIO_SCHEMA: "MediaReference.1",
//         target: ts.videoURL,
//       },
//       source_range: {
//         OTIO_SCHEMA: "TimeRange.1",
//         start_time: 0,
//         duration,
//       } as TimeRange,
//       tracks: [
//         {
//           OTIO_SCHEMA: "Track.1",
//           kind: "video", // TBD audio only tracks
//           children: [
//             {
//               OTIO_SCHEMA: "Stack.1",
//               tracks: [
//                 {
//                   OTIO_SCHEMA: "Track.1",
//                   kind: "video",
//                   children: clips as Clip[],
//                 },
//               ] as Track[],
//             },
//           ] as Stack[],
//           // TDB single clip as single source transcript?
//         },
//       ] as Track[],
//     } as Stack,
//   };

//   return timeline;
// }

export default App;
