/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useReducer, useCallback, useMemo, useEffect, useRef, PropsWithChildren } from 'react';
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
  const remixListener = React.useRef<any>();
  // const [css, setCss] = useState({} as any);
  const [css, dispatchCss] = useReducer((state, action) => ({ ...state, ...action }), {});

  useEffect(() => {
    // console.log('remixRef.current', remixRef.current);
    if (!remixRef.current) return;

    remixListener.current = remixRef.current!.addEventListener('playhead', (e: any) => {
      // console.log({ e });
      const { pseudo, transcript, media, section, clip, timedText, offset } = e.detail;
      console.log('playhead', e.detail);

      const { sid } = section?.metadata?.data ?? { sid: 'default' };

      if (timedText) {
        const { selector, element } = timedText.metadata;

        const time = element?.getAttribute('data-t')?.split(',')?.[0];
        const players = Array.from(document.querySelectorAll(`div[data-sid="${sid}"] timedtext-player`));
        players.forEach((player) => {
          // if (e.target === player) element.scrollIntoView({ behavior: 'instant', block: 'center' });
          if (pseudo) {
            document.querySelector(selector)!.scrollIntoView({ behavior: 'instant', block: 'center' });
            const sourceIndex = sources.findIndex((s) => s?.metadata?.sid === sid);
            // console.log({ source });
            setTabValue(sourceIndex);
          }
          if (pseudo || !time || e.target === player) return;
          // (player as HTMLMediaElement).currentTime = parseFloat(time);
          (player as any).currentPseudoTime = parseFloat(time);
          // element.scrollIntoView({ behavior: 'instant', block: 'center' });
        });

        // document.querySelector(clip.metadata.selector)!.scrollIntoView({ behavior: 'instant', block: 'center' });

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
        `;

        // setCss({ ...css, [transcript]: cssText });
        dispatchCss({ [transcript]: cssText });
        // setCss({ [transcript]: cssText });
      } else {
        // css.textContent = '';
      }
    });

    return () => remixRef.current!.removeEventListener('playhead', remixListener.current);
  }, [sources]);

  const tools = useMemo(
    () => [
      {
        name: 'title',
        template: '#title',
        draggable: true,
        toolBarComponent: <div>Title</div>,
        timelineComponent: (
          <div>
            <fieldset>
              <legend>Title</legend>
              <input type="text" value={'title'}></input>
            </fieldset>
          </div>
        ),
      },
      {
        name: 'FIN',
        template: '#fin',
        draggable: true,
        toolBarComponent: <div>FIN</div>,
        timelineComponent: (
          <div>
            <fieldset>
              <legend>Fade IN</legend>
              <input type="range" />
            </fieldset>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <>
      {/* <template id="video1">
        <video controls src="${src}" width="${width}" height="${height}" style={{ width: '100%' }}>
          {`<!-- -->`}
        </video>
      </template> */}
      <style>
        {`
          ${Object.values(css).join('\n\n')}

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
          ____p::before {
            content: '¶ 'attr(data-t);
            display: block;
            font-size: 0.8em;
            color: blue;
          }

          #S-EMPTY2:only-child {
            _display: none;
            border: 1px solid blue;
            opacity: 0;
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
                <RemixDestination tools={tools} />
              </Box>
            </Box>
          </Box>
        </RemixContext>
      </Box>
    </>
  );
}

const ToolBarWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <div style={{ border: '1px solid green' }}>{children}</div>
);

export default App;
