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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const width = 720;

  const sources = useMemo(() => [ts2timeline(A), ts2timeline(B), ts2timeline(C)] as Timeline[], []);
  const remix = useMemo(() => ts2timeline(E), []);

  const active = useMemo(() => sources[tabValue]?.metadata?.id, [tabValue, sources]);

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
                  {sources.map((source, i) => (
                    <Tab key={i} label={source?.metadata?.story?.title} />
                  ))}
                  <Tab label="Transcript One" />
                  <Tab label="Transcript Two" />
                  <Tab label="Transcript Three" />
                </Tabs>
              </Box>
              <Box
                sx={{
                  overflowY: 'auto',
                  height: 'calc(100vh - 64px)',
                  width: width,
                  padding: 0,
                }}
              >
                <RemixSources active={active} />
              </Box>
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

export default App;
