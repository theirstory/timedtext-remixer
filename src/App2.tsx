/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useReducer, useMemo, useEffect, PropsWithChildren, useContext, useState, useCallback } from 'react';
import { Box, Tab, Tabs, TextField, Chip, Typography } from '@mui/material';
import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import RemixContext, { Context } from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { ts2timeline } from '../lib/utils.js';
import type { Timeline } from '../lib/interfaces';

import A from './data/A.json';
import B from './data/B.json';
import C from './data/C.json';
import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

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

  const isDestinationEmpty = remix?.tracks?.children[0].children.length === 1;

  useEffect(() => {
    if (!remixRef.current) return;

    const scrollEnabled = true;

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
            const node = document.querySelector(selector);
            if (node && scrollEnabled)
              scrollIntoView(node, {
                behavior: 'smooth',
              });
          }
          if (pseudo || !time || e.target === player) return;
          (player as any).currentPseudoTime = parseFloat(time);
        });

        const node = document.querySelector(clip.metadata.selector);
        if (node && scrollEnabled)
          scrollIntoView(node, {
            behavior: 'smooth',
          });

        const cssText = `
          ${transcript} {
            ${selector} {
              color: #239B8B !important;
            }

            ${selector} ~ span {
              color: #717171 !important;
            }

            ${clip.metadata.selector} ~ p, div:has(span[data-t="${element.getAttribute('data-t')}"]) ~ div {
              color: #717171;
            }

            ${clip.metadata.selector.replace('> p', '')} ~ div.BlockWrapper, div:has(span[data-t="${element.getAttribute('data-t')}"]) ~ div {
              color: #717171 !important;
            }

            ${section.metadata.selector} ~ section, div[data-rfd-draggable-id="${section.metadata.selector.replace('#', '')}"] ~ div {
              color: #717171;
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
        type: 'title',
        template: '#title',
        draggable: true,
        toolBarComponent: <Chip label="Title" variant="outlined" />,
        // timelineComponent: (
        //   <div style={{ backgroundColor: 'white', padding: 5 }}>
        //     <TextField label="Title" value={'Sample title'} style={{ width: '100%' }} />
        //   </div>
        // ),
        timelineComponent: <TitleTool />,
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


          /* temp style of the empty remix entry */
          #S-EMPTY2:only-child {
            display: none;
            border: 1px solid blue;
            opacity: 10;
          }
        `}
      </style>
      <Box id="container" ref={remixRef}>
        <RemixContext sources={sources} remix={remix}>
          <Box id="tabs-container">
            <Tabs
              TabIndicatorProps={{ style: { display: 'none' } }}
              value={tabValue}
              onChange={handleTabChange}
              aria-label="tabbed content"
              sx={{ minHeight: '0px' }}
            >
              {sources.map((source, i) => (
                <Tab
                  sx={{
                    borderRadius: '8px 8px 0px 0px',
                    borderTop: '1px solid var(--Dark-20, #D9DCDE)',
                    borderRight: '1px solid var(--Dark-20, #D9DCDE)',
                    // borderLeft: '1px solid var(--Dark-20, #D9DCDE)',
                    backgroundColor: 'var(--Light-100, #FFF)',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 700,
                    minHeight: '0px',
                    padding: '6px 8px 6px 8px',
                    lineHeight: '20px',
                    '&.Mui-selected': {
                      color: '#239B8B',
                      borderBottom: 'none',
                    },
                    borderBottom: tabValue !== i ? '1px solid var(--Dark-20, #D9DCDE)' : 'none',
                  }}
                  key={i}
                  label={source?.metadata?.story?.title}
                />
              ))}
            </Tabs>
          </Box>
          <Box id="columns-container" display="flex" columnGap="20px">
            <Box
              id="left-column-container"
              borderRadius="0px 8px 8px 8px"
              sx={{ backgroundColor: '#FFFFFF', flex: 1 }}
              paddingX="24px"
            >
              <RemixSources
                active={active}
                PlayerWrapper={LeftPlayerWrapper}
                SourceWrapper={SourceWrapper}
                BlockWrapper={BlockWrapper}
                SelectionWrapper={SelectionWrapper}
              />
            </Box>

            <Box
              id="right-column-container"
              borderRadius="8px"
              sx={{ backgroundColor: '#FFFFFF', flex: 1 }}
              display="flex"
              flexDirection="column"
              paddingX="24px"
            >
              <RemixDestination
                PlayerWrapper={
                  // isDestinationEmpty ? EmptyPlayer :
                  RightPlayerWrapper
                }
                DestinationWrapper={DestinationWrapper}
                BlockWrapper={BlockWrapper}
                tools={tools}
                Empty={EmptyRemix}
              />
            </Box>
          </Box>
        </RemixContext>
      </Box>
    </>
  );
}

// Tools

const TitleTool = ({ id, value }: { id: string; value: string }): JSX.Element => {
  const { dispatch } = useContext(Context);
  const [text, setText] = useState<string>(value);

  return (
    <div style={{ backgroundColor: 'white', padding: 5 }}>
      <TextField
        label="Title"
        value={text}
        style={{ width: '100%' }}
        onChange={({ target: { value } }) => setText(value)}
        onBlur={() => dispatch({ type: 'metadata', payload: { id, metadata: { value: text } } })}
      />
      {/* <button onClick={() => dispatch({ type: 'metadata', payload: { id, metadata: { value: text } } })}>ok</button> */}
    </div>
  );
};

// Wrappers

const EmptyRemix = (): JSX.Element => (
  <Box id="EmptyRemix" height="302px" borderRadius="8px" sx={{ backgroundColor: '#f6e52c', textAlign: 'center' }}>
    <Typography>TheirStory</Typography>
    <p>Drop here</p>
  </Box>
);

const EmptyPlayer = (): JSX.Element => (
  <Box id="EmptyPlayer" height="302px" borderRadius="8px" sx={{ backgroundColor: '#464C53', textAlign: 'center' }}>
    <Typography>TheirStory</Typography>
  </Box>
);

const LeftPlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="leftPlayerWrapper"
    marginTop="16px"
    borderRadius="8px"
    sx={{ backgroundColor: '#8E979F', textAlign: 'center' }}
  >
    {children}
  </Box>
);
const RightPlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="rightPlayerWrapper"
    marginTop="16px"
    borderRadius="8px"
    sx={{ backgroundColor: '#8E979F', textAlign: 'center' }}
  >
    {children}
  </Box>
);

// Left transcript
const SourceWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="sourceWrapper"
    sx={{
      backgroundColor: '#FFFFFF',
      paddingY: '16px',
      marginTop: '16px',
      maxHeight: 'calc(100vh - 595px)',
      overflowY: 'auto',
      borderRadius: '8px',
      '& p': {
        fontFamily: 'Public Sans, sans-serif',
        // color: '#000000',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
      },
    }}
  >
    {children}
  </Box>
);

// Right transcript
const DestinationWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="destinationWrapper"
    sx={{
      backgroundColor: '#FFFFFF',
      paddingY: '16px',
      maxHeight: 'calc(100vh - 622px)',
      overflowY: 'auto',
      borderRadius: '8px',
      '& p': {
        // color: '#000000',
        fontSize: '14px',
        fontWeight: 400,
        lineHeight: '20px',
        margin: '0px',
      },
      '& section': {
        backgroundColor: '#F7F9FC',
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        padding: '12px',
        marginBottom: '12px',
      },
    }}
  >
    {children}
  </Box>
);

const SelectionWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <span className="SelectionWrapper" style={{ backgroundColor: '#d3ebe8' }}>
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
