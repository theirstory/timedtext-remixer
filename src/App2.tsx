/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useReducer, useMemo, useEffect, PropsWithChildren } from 'react';
import { Box, Tab, Tabs, TextField, Chip, Slider } from '@mui/material';
// import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import RemixContext from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { ts2timeline } from '../lib/utils.js';
import type { Timeline } from '../lib/interfaces';

import A from './data/A.json';
import B from './data/B.json';
import C from './data/C.json';
import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

// Fixed player dimensions for now
const width = 620; // width of the video player
const height = 360; // height of the video player

function App() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const sources = useMemo(() => [ts2timeline(A), ts2timeline(B), ts2timeline(C)] as Timeline[], []);
  const remix = EMPTY_REMIX;

  const active = useMemo(() => sources[tabValue]?.metadata?.id, [tabValue, sources]);

  const remixRef = React.useRef<any>();
  const remixListener = React.useRef<any>();
  const [css, dispatchCss] = useReducer((state: any, action: any) => ({ ...state, ...action }), {});

  useEffect(() => {
    if (!remixRef.current) return;

    remixListener.current = remixRef.current!.addEventListener('playhead', (e: any) => {
      const { pseudo, transcript, section, clip, timedText } = e.detail;
      console.log('playhead', e.detail);

      const { sid } = section?.metadata?.data ?? { sid: 'default' };

      if (timedText) {
        const { selector, element } = timedText.metadata;

        const time = element?.getAttribute('data-t')?.split(',')?.[0];
        const players = Array.from(document.querySelectorAll(`div[data-sid="${sid}"] timedtext-player`));
        players.forEach((player) => {
          if (pseudo) {
            const sourceIndex = sources.findIndex((s) => s?.metadata?.sid === sid);
            setTabValue(sourceIndex);
          } else {
            // const node = document.querySelector(selector);
            // if (node)
            //   scrollIntoView(node, {
            //     behavior: 'smooth',
            //   });
          }
          if (pseudo || !time || e.target === player) return;
          (player as any).currentPseudoTime = parseFloat(time);
        });

        // const node = document.querySelector(clip.metadata.selector);
        // if (node)
        //   scrollIntoView(node, {
        //     behavior: 'smooth',
        //   });

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

        dispatchCss({ [transcript]: cssText });
      }
    });

    return () => remixRef.current!.removeEventListener('playhead', remixListener.current);
  }, [sources]);

  // Toolbar tools
  const tools = useMemo(
    () => [
      {
        name: 'title',
        template: '#title',
        draggable: true,
        toolBarComponent: <Chip label="Title" variant="outlined" />,
        timelineComponent: (
          <div style={{ backgroundColor: 'white', padding: 5 }}>
            <TextField label="Title" value={'Sample title'} style={{ width: '100%' }} />
          </div>
        ),
      },
      // {
      //   name: 'FIN',
      //   template: '#fin',
      //   draggable: true,
      //   toolBarComponent: <Chip label="Fade In" variant="outlined" />,
      //   timelineComponent: (
      //     <div style={{ backgroundColor: 'white', padding: 5 }}>
      //       <Slider size="small" style={{ width: '90%' }} />
      //     </div>
      //   ),
      // },
    ],
    [],
  );

  return (
    <>
      <style>
        {`
          ${Object.values(css).join('\n\n')}

          section {
            outline: 1px solid darkgrey;
            margin: 5px;
            padding: 5px;
          }

          /* temp style of the empty remix entry */
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
          width: 2 * width + 10, // 2 x player width + spacer middle column
        }}
        ref={remixRef}
      >
        {/* RemixContext needs to wrap both RemixSources and RemixDestination */}
        <RemixContext sources={sources} remix={remix}>
          <Box display="flex" flexGrow={1}>
            {/* Left column */}
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
                  height: 'calc(100vh - 64px)', // 64px is the height of the tabs
                  width: width,
                }}
              >
                <RemixSources
                  active={active}
                  PlayerWrapper={PlayerWrapper}
                  SourceWrapper={SourceWrapper}
                  BlockWrapper={BlockWrapper}
                  SelectionWrapper={SelectionWrapper}
                />
              </Box>
            </Box>
            <Box flex={1} display="flex" flexDirection="column" style={{ width: 10 }}>
              {/* middle spacer column */}
            </Box>
            {/* Right column */}
            <Box flex={1}>
              <Box sx={{ height: 'calc(100vh - 64px)' }}>
                <div style={{ height: 49 }}>{/* spacer for lining up due to tabs on left */}</div>
                <RemixDestination
                  PlayerWrapper={PlayerWrapper}
                  DestinationWrapper={DestinationWrapper}
                  BlockWrapper={BlockWrapper}
                  tools={tools}
                />
              </Box>
            </Box>
          </Box>
        </RemixContext>
      </Box>
    </>
  );
}

// Wrappers

// Player wrapper, 44px is player controls height
const PlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <div className="PlayerWrapper" style={{ width, height: height + 44, backgroundColor: 'black' }}>
    {children}
  </div>
);

// Left transcript
const SourceWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <div
    className="DestinationWrapper"
    style={{ height: `calc(100vh - ${64 + 44 + height}px)`, overflowY: 'auto', padding: 0 }}
  >
    {children}
  </div>
);

// Right transcript
const DestinationWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <div
    className="DestinationWrapper"
    style={{ height: `calc(100vh - ${64 + 44 + height}px)`, overflowY: 'auto', padding: 0 }}
  >
    {children}
  </div>
);

const SelectionWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <span className="SelectionWrapper" style={{ borderBottom: '1px solid blue' }}>
    {children}
  </span>
);

// Paragraph wrapper, todo: add speaker data
const BlockWrapper = ({ children }: PropsWithChildren): JSX.Element => <div className="BlockWrapper">{children}</div>;

// Not used yet
// const ToolBarWrapper = ({ children }: PropsWithChildren): JSX.Element => (
//   <div className="ToolBarWrapper" style={{ border: '1px solid green' }}>
//     {children}
//   </div>
// );

export default App;
