/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useReducer, useCallback, useMemo, useEffect, useRef } from 'react';
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
// import E from './data/E.json';
import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

function App() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const width = 720;

  const sources = useMemo(() => [ts2timeline(A), ts2timeline(B), ts2timeline(C)] as Timeline[], []);
  // const remix = useMemo(() => ts2timeline(E), []);
  const remix = EMPTY_REMIX;

  const active = useMemo(() => sources[tabValue]?.metadata?.id, [tabValue, sources]);

  const remixRef = React.useRef<any>();
  const [css, setCss] = useState<string>('');
  useEffect(() => {
    console.log('remixRef.current', remixRef.current);
    if (!remixRef.current) return;

    remixRef.current!.addEventListener('playhead', (e: any) => {
      const { transcript, media, section, clip, timedText, offset } = e.detail;
      console.log('playhead', { transcript, media, section, clip, timedText, offset });

      if (timedText) {
        const { selector, element } = timedText.metadata;

        const cssText = `
          ${transcript} {
            ${selector} {
              color: red !important;
            }

            ${selector} ~ span {
              color: #cccccc !important;
            }

            ${clip.metadata.selector} ~ p, div:has(span[data-t="${element.getAttribute('data-t')}"]) ~ div {
              color: #cccccc;
            }

            ${section.metadata.selector} ~ section, div[data-rfd-draggable-id="${section.metadata.selector.replace('#', '')}"] ~ div {
              color: #cccccc;
            }
          }

          article:not(${transcript}) {
            section[data-media-src="${media}"] {
              span[data-t="${element.getAttribute('data-t')}"] {
                 outline: 1px solid red !important;
              }
            }
          }
        `;

        setCss(cssText);
      } else {
        // css.textContent = '';
      }
    });
  }, [remixRef]);

  return (
    <>
      {/* <template id="video1">
        <video controls src="${src}" width="${width}" height="${height}" style={{ width: '100%' }}>
          {`<!-- -->`}
        </video>
      </template> */}
      <style>
        {`
          ${css}

          section::before {
            content: '§ 'attr(data-t)' + 'attr(data-offset)' 'attr(data-media-src);
            display: block;
            font-size: 0.8em;
            color: red;
          }
          section {
            outline: 1px solid red;
            margin: 5px;
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
        ref={remixRef}
      >
        <RemixContext sources={sources} remix={remix}>
          <Box display="flex" flexGrow={1}>
            <Box flex={1} display="flex" flexDirection="column" style={{ width: width }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 0 }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="tabbed content">
                  {sources.map((source, i) => (
                    <Tab key={i} label={source?.metadata?.story?.title} />
                  ))}
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
                <RemixSources
                  active={active}
                  // PlayerWrapper={({ children }) => <div style={{ background: 'black' }}>{children}</div>}
                />
              </Box>
            </Box>
            <Box flex={1}>
              <Box sx={{ overflowY: 'auto', height: 'calc(100vh - 64px)' }}>
                <div style={{ height: 59 }}></div>
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
