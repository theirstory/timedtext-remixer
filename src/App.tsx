/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useEffect, useState, useCallback, useReducer } from 'react';
import { renderToString } from 'react-dom/server';
import { Box, Tab, Tabs, Typography, IconButton, Toolbar, Drawer, Tooltip, Snackbar, AlertColor } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';

import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import RemixContext from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { StaticRemix } from '../lib/StaticRemix.js';
import { timeline2remix, remix2timeline } from '../lib/utils.js';
import type { Timeline } from '../lib/interfaces';
import { AddTransition } from './Assets/AddTransition.tsx';

import SettingsIcon from '@mui/icons-material/Settings';
import { SettingsPopUp } from './components/SettingsPopUp';

import rT4 from './data/r-66043ea15b6357760d02b9a4.json';
import rT5 from './data/r-61929022c65d8e0005450522.json';
import rT6 from './data/r-64380a5ea0e98efaffc0d029.json';
import rT7 from './data/r-6165da2ee1d20f0005a0fc0a.json';
import rT8 from './data/r-63e4ea003770cdb1733b6199.json';

import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

import {
  TEMPLATES,
  FadeInTool,
  TitleTool,
  // GAPTool,
  EmptyRemix,
  EmptySource,
  LeftPlayerWrapper,
  RightPlayerWrapper,
  SourceWrapper,
  DestinationWrapper,
  SelectionWrapper,
  ToolbarWrapper,
  BlockWrapperLeft,
  BlockWrapperRight,
  SectionContentWrapper,
  ExportRemix,
  FadeInDraggable,
  TitleDraggable,
} from './wrappers.tsx';
import { SourceDrawer } from './components/SourceDrawer.tsx';
import TopRightIcons from './components/TopRightIcons.tsx';

function App() {
  const [remix, setRemix] = useState<Timeline>(EMPTY_REMIX as unknown as Timeline);
  const [tabValue, setTabValue] = React.useState(0);
  const [autoscroll, setAutoscroll] = React.useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [toastSeverity, setToastSeverity] = useState<AlertColor>('success');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleAutoscrollChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoscroll(event.target.checked);
  };

  const allSources = useMemo(
    () => [remix2timeline(rT4), remix2timeline(rT5), remix2timeline(rT6), remix2timeline(rT7), remix2timeline(rT8)],
    // () => [remix2timeline(rT4)],
    [],
  );

  const [sources, dispatchSources] = useReducer(
    (state: any, action: any) => {
      switch (action.type) {
        case 'add':
          return [...state, action.payload];
        case 'remove':
          return state.filter((s: any) => s.metadata.id !== action.payload.id);
        default:
          return state;
      }
    },
    [remix2timeline(rT4), remix2timeline(rT5), remix2timeline(rT6), remix2timeline(rT7), remix2timeline(rT8)],
    // [remix2timeline(rT4)],
  );

  // const initRemix = EMPTY_REMIX;

  const active = useMemo(() => sources[tabValue]?.metadata?.id, [tabValue, sources]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const toggleDrawer = (drawerOpen: boolean) => () => {
    setDrawerOpen(drawerOpen);
  };
  const toggleExportDrawer = (exportDrawerOpen: boolean) => () => {
    setExportDrawerOpen(exportDrawerOpen);
  };

  const remixRef = React.useRef<any>();
  const autoscrollRef = React.useRef<any>(); // actually context live-view
  const scrollRef = React.useRef<any>(); // actually auto scrolling
  // const [css, dispatchCss] = useReducer((state: any, action: any) => ({ ...state, ...action }), {});

  useEffect(() => {
    autoscrollRef.current = autoscroll;
  }, [autoscroll]);

  useEffect(() => {
    scrollRef.current = scrolling;
  }, [scrolling]);

  // const css2: { [key: string]: string } = {};
  const css3 = React.useRef<{ [key: string]: string }>({});

  useEffect(() => {
    if (!remixRef.current) return;

    const remixRefCurrent = remixRef.current;
    const listener = remixRefCurrent.addEventListener('playhead', (e: any) => {
      const { pseudo, transcript, section, clip, timedText } = e.detail;
      console.log('playhead', e.detail, e.target);
      // const css2: { [key: string]: string } = {};

      const { sid } = section?.metadata ?? { id: 'default' };
      const sectionEl = document.querySelector(section.metadata.selector);

      if (timedText) {
        const { selector, element } = timedText.metadata;

        const time = element?.getAttribute('data-t')?.split(',')?.[0];
        const players = Array.from(document.querySelectorAll(`div[data-sid="${sid}"] timedtext-player`));
        console.log({ players, sid, section, pseudo, autoscroll: autoscrollRef.current, scrollRef: scrollRef.current });
        players.forEach((player) => {
          if (pseudo && autoscrollRef.current) {
            const sourceIndex = sources.findIndex((s: { metadata: { id: any } }) => s?.metadata?.id === sid);
            if (sourceIndex > -1) setTabValue(sourceIndex);
          } else {
            // const node = document.querySelector(selector);
            // if (node && autoscrollRef.current)
            //   scrollIntoView(node, {
            //     behavior: 'smooth',
            //   });
          }
          if (pseudo || !time || e.target === player) return;
          if (autoscrollRef.current && player) {
            (player as any).currentPseudoTime = parseFloat(time);
            // (player as any).currentTime = parseFloat(time);
          }
        });

        const node = sectionEl?.querySelector(clip.metadata.selector);
        // console.log('node', clip.metadata.selector);
        if (node && (autoscrollRef.current || !pseudo) && scrollRef.current) {
          scrollIntoView(node, {
            behavior: 'smooth',
          });
        }

        const cssText = `
          ${transcript} {
            ${selector} {
              color: #1C7C6F !important;
              text-decoration: underline;
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

        // dispatchCss({ [transcript]: cssText });
        console.log({ css3 });
        css3.current[transcript] = cssText;
        const style = document.getElementById('injected');
        style!.innerHTML = Object.values(css3.current).join('\n/* */\n');
      }
    });

    return () => remixRefCurrent.removeEventListener('playhead', listener);
  }, [sources]);

  useEffect(() => {
    if (!remixRef.current) return;

    const remixRefCurrent = remixRef.current;
    const listener = remixRefCurrent.addEventListener('remixChange', (e: any) => {
      setRemix(e.detail);
    });
    return () => remixRefCurrent.removeEventListener('remixChange', listener);
  }, [remixRef]);

  // Left Toolbar tools
  const toolsLeft = useMemo(
    () => [
      // {
      //   name: 'scroll',
      //   type: 'scroll',
      //   draggable: false,
      //   toolBarComponent: <Checkbox defaultChecked />, // <Chip label="Scroll" variant="outlined" />,
      //   timelineComponent: null,
      //   defaults: {
      //     value: true,
      //   },
      // },
    ],
    [],
  );

  // Right Toolbar tools
  const tools = useMemo(
    () => [
      {
        name: 'fin',
        type: 'fin',
        draggable: true,
        toolBarComponent: (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              columnGap: '4px',
              // width: '100px',
              // width: '100%',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              color: '#239B8B',
              backgroundColor: 'rgba(35, 155, 139, 0.15)',
              padding: '6px',
              borderRadius: '8px',
              marginRight: '8px',
              '&:hover': {
                backgroundColor: 'rgba(35, 155, 139, 0.30)',
              },
              '&:active': {
                backgroundColor: 'rgba(35, 155, 139, 0.30)',
              },
            }}
          >
            <AddTransition />
            Transition
          </Box>
        ),
        timelineComponent: FadeInTool,
        draggableComponent: FadeInDraggable,
        defaults: {
          title: 'Fade',
          template: '#fin',
          duration: 5,
          apply: 'both',
        },
      },
      {
        name: 'title',
        type: 'title',
        draggable: true,
        toolBarComponent: (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              columnGap: '4px',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              color: '#239B8B',
              backgroundColor: 'rgba(35, 155, 139, 0.15)',
              padding: '6px',
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(35, 155, 139, 0.30)',
              },
              '&:active': {
                backgroundColor: 'rgba(35, 155, 139, 0.30)',
              },
            }}
          >
            <PostAddOutlinedIcon style={{ width: '20px', height: '20px' }} />
            Title
          </Box>
        ),
        timelineComponent: TitleTool,
        draggableComponent: TitleDraggable,
        defaults: {
          title: 'Title',
          subtitle: 'Subtitle',
          template: '#title-full',
          duration: 5,
          gap: false,
          apply: 'next',
        },
      },
    ],
    [],
  );

  const onTabClose = (e: MouseEvent, source: Timeline) => {
    e.stopPropagation();
    dispatchSources({ type: 'remove', payload: { id: source?.metadata?.id } });
  };

  const openTab = (source: Timeline) => {
    setDrawerOpen(false);
    const index = sources.findIndex((s: Timeline) => s?.metadata?.id === source?.metadata?.id);
    if (index >= 0) {
      setTabValue(index);
    } else {
      dispatchSources({ type: 'add', payload: source });
      setTabValue(sources.length);
    }
  };

  const saveRemix = useCallback(() => {
    // const remix2 = timeline2remix(remix);
    // console.log('remix', remix);
    // console.log('remix2', remix2);
    // const remix3 = remix2timeline(remix2);
    // console.log('remix3', remix3);

    const remix4 = timeline2remix(remix);
    console.log('remix4', remix4);
    // const remix5 = remix2timeline2(remix4);
    // console.log('remix4->t', remix5);

    localStorage.setItem('remix', JSON.stringify(remix4));

    setToastMessage('Remix saved successfully');
    setToastSeverity('success');
    setToastOpen(true);
  }, [remix]);

  const loadRemix = useCallback(() => {
    const remix2 = JSON.parse(localStorage.getItem('remix') || 'null');
    console.log('remix', remix2);
    // const remix3 = remix2timeline(remix2);
    const remix4 = remix2timeline(remix2);
    // console.log('remix3', remix3);
    // if (remix3) setRemix(remix3);
    if (remix4) setRemix(remix4);

    setToastMessage('Remix loaded successfully');
    setToastSeverity('success');
    setToastOpen(true);
  }, []);

  const exportRemix = useCallback(() => {
    const html = renderToString(<StaticRemix remix={remix} templates={TEMPLATES} />);
    console.log(html);

    const element = document.createElement('a');
    const file = new Blob([html], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = 'remix.html';
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();

    setToastMessage('Remix exported successfully');
    setToastSeverity('success');
    setToastOpen(true);
  }, [remix]);

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    console.log('handleClick', event.currentTarget);
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleAutoScroll = () => {
    setScrolling(!scrolling);
  };

  const handleToggleContextView = () => {
    setAutoscroll(!autoscroll);
  };

  return (
    <>
      <style>
        {`
          /* $ { Object.values(css).join('\n\n') } */


          /* temp style of the empty remix entry */
          #___S-EMPTY2:only-child {
            display: none;
            border: 1px solid blue;
            opacity: 10;
          }

          #EmptyRemix {
            display: none;
          }

          div[data-rfd-draggable-id="S-EMPTY"] section {
            display: none;
          }

          div[data-rfd-draggable-id="S-EMPTY"] ~ #EmptyRemix {
            display: block;
          }

          section p {
            cursor: pointer;
            /* content-visibility: auto; */
          }

          .widget + .SectionContentWrapper {
            display: none;
          }

        `}
      </style>
      {drawerOpen && (
        <SourceDrawer
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          sources={allSources}
          onClickSource={(source) => openTab(source)}
        />
      )}
      <Drawer open={exportDrawerOpen} onClose={toggleExportDrawer(false)} anchor="right">
        {exportDrawerOpen ? <ExportRemix remix={remix} /> : null}
      </Drawer>
      <Box
        id="container"
        ref={remixRef}
        display="flex"
        justifyContent="center"
        sx={{ padding: '8px', height: 'calc(100% - 16px)' }}
      >
        <RemixContext
          sources={sources}
          remix={remix}
          poster="https://placehold.co/640x360?text=16:9"
          width={620}
          height={360}
          tools={tools}
        >
          <Box
            id="columns-container"
            display={'grid'}
            gap={'8px'}
            height={'100%'}
            maxWidth={'1440px'}
            gridTemplateColumns={'1fr 1fr'}
          >
            <Box
              id="left-column-container"
              borderRadius="0px 8px 8px 8px"
              sx={{ backgroundColor: '#FFFFFF', width: '685px' }}
              padding="16px"
            >
              <Box id="tabs-container" display="flex">
                <Tabs
                  TabIndicatorProps={{ style: { display: 'none' } }}
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="tabbed content"
                  sx={{
                    minHeight: '0px',
                    '& .MuiTabs-scrollButtons.Mui-disabled': {
                      width: '0px', // Elimina el espacio cuando está deshabilitado
                      visibility: 'hidden', // Oculta visualmente cuando está deshabilitado
                    },
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  {sources.map((source, i) => (
                    <Tab
                      sx={{
                        borderRadius: '8px 8px 0px 0px',
                        borderTop: '1px solid var(--Dark-20, #D9DCDE)',
                        borderRight: '1px solid var(--Dark-20, #D9DCDE)',
                        borderLeft: i === 0 ? '1px solid var(--Dark-20, #D9DCDE)' : 'none',
                        backgroundColor: tabValue !== i ? '#F7F9FC' : '#FFF',
                        textTransform: 'none',
                        // fontSize: '14px',
                        // fontWeight: 700,
                        minHeight: '0px',
                        padding: '6px 8px 6px 8px',
                        // lineHeight: '20px',
                        '&.Mui-selected': {
                          color: '#239B8B',
                          borderBottom: 'none',
                        },
                        borderBottom: tabValue !== i ? '1px solid var(--Dark-20, #D9DCDE)' : 'none',
                      }}
                      key={i}
                      label={
                        <Tooltip title={source?.metadata?.story?.title}>
                          <Toolbar disableGutters variant="dense" sx={{ minHeight: '0px' }}>
                            <Typography
                              sx={{
                                maxWidth: '150px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                              fontSize="14px"
                              fontWeight={700}
                              lineHeight="20px"
                            >
                              {source?.metadata?.title}
                            </Typography>
                            <IconButton sx={{ padding: 0 }} onClick={(e: React.MouseEvent) => onTabClose(e, source)}>
                              <CloseIcon style={{ width: '20px', height: '20px' }} />
                            </IconButton>
                          </Toolbar>
                        </Tooltip>
                      }
                    />
                  ))}
                </Tabs>
                <Tooltip title="Add media">
                  <IconButton onClick={toggleDrawer(true)} aria-label="toggleDrawer" sx={{ marginLeft: 'auto' }}>
                    <PlaylistAddIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              {/* <Box height="100%"> */}
              <RemixSources
                active={active}
                PlayerWrapper={LeftPlayerWrapper}
                SourceWrapper={SourceWrapper}
                BlockWrapper={BlockWrapperLeft}
                SelectionWrapper={SelectionWrapper}
                ToolbarWrapper={ToolbarWrapper}
                tools={toolsLeft}
                Empty={EmptySource}
              />
              {/* </Box> */}
            </Box>

            <Box
              id="right-column-container"
              borderRadius="8px"
              sx={{ backgroundColor: '#FFFFFF', flex: 1, width: '685px' }}
              display="flex"
              flexDirection="column"
              paddingX="24px"
              paddingTop="24px"
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontSize="14px" fontWeight={700} lineHeight="20px" color="#464C53">
                  Remix
                </Typography>
                <TopRightIcons handleLoad={loadRemix} handleSave={saveRemix} handleExport={exportRemix} />
              </Box>
              <RemixDestination
                PlayerWrapper={
                  // isDestinationEmpty ? EmptyPlayer :
                  RightPlayerWrapper
                }
                DestinationWrapper={DestinationWrapper}
                SectionContentWrapper={SectionContentWrapper}
                BlockWrapper={BlockWrapperRight}
                // ToolbarWrapper={ToolbarWrapper}
                Settings={
                  <div>
                    <IconButton
                      onClick={handleClick}
                      sx={{
                        borderRadius: '4px',
                        padding: '6px',
                        '&:hover': {
                          backgroundColor: '#e7e9ea',
                        },
                        '&:active': {
                          backgroundColor: '#e7e9ea',
                        },
                      }}
                    >
                      <Tooltip title="Settings">
                        <SettingsIcon style={{ color: '#606971' }} />
                      </Tooltip>
                    </IconButton>
                    <SettingsPopUp
                      anchorEl={anchorEl}
                      autoScroll={scrolling}
                      contextView={autoscroll}
                      handleClose={handleClose}
                      onToggleAutoScroll={handleToggleAutoScroll}
                      onToggleContextView={handleToggleContextView}
                    />
                  </div>
                }
                tools={tools}
                Empty={EmptyRemix}
              />
            </Box>
          </Box>
        </RemixContext>
      </Box>
      <Snackbar open={toastOpen} autoHideDuration={6000} onClose={handleCloseToast} message={toastMessage} />
      <div
        dangerouslySetInnerHTML={{
          __html: TEMPLATES,
        }}
      />
    </>
  );
}

export default App;
