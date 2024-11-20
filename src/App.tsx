/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useEffect, useState, useCallback, useReducer, useRef } from 'react';
import { Box, Tab, Tabs, Typography, IconButton, Toolbar, Drawer, Tooltip, Snackbar, AlertColor } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';

import scrollIntoView from 'smooth-scroll-into-view-if-needed';

import RemixContext from '../lib/RemixContext.js';
import RemixSources from '../lib/RemixSources.js';
import RemixDestination from '../lib/RemixDestination.js';
import { ts2timeline } from '../lib/utils.js';
import type { ExternalSource, Timeline } from '../lib/interfaces';
import { AddTransition } from './Assets/AddTransition.tsx';

import SettingsIcon from '@mui/icons-material/Settings';
import { SettingsPopUp } from './components/SettingsPopUp';

import T4 from './data/66043ea15b6357760d02b9a4.json';
import T5 from './data/61929022c65d8e0005450522.json';
import T6 from './data/64380a5ea0e98efaffc0d029.json';
import T7 from './data/6165da2ee1d20f0005a0fc0a.json';
import T8 from './data/63e4ea003770cdb1733b6199.json';
import { EMPTY_REMIX } from '../lib/utils.js';

import './App.css';

import {
  TEMPLATES,
  FadeInTool,
  TitleTool,
  // GAPTool,
  EmptyDestinationRemix,
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
  EmptySourceRemix,
} from './wrappers.tsx';
import { SourceDrawer } from './components/SourceDrawer.tsx';
import TopRightIcons from './components/TopRightIcons.tsx';
import { axiosInstance } from './services/axiosInstance.ts';
import { SourceDrawerExternalApi } from './components/SourceDrawerExternalApi.tsx';

function App() {
  const [remix, setRemix] = useState<Timeline>(EMPTY_REMIX);
  const [tabValue, setTabValue] = React.useState(0);
  const [autoscroll, setAutoscroll] = React.useState(false);
  const [scrolling, setScrolling] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const isDestinationRemixerEmpty = remix?.tracks?.children[0].children.length === 0;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [exportDrawerOpen, setExportDrawerOpen] = useState(false);
  const [emptyVideoPosterUrl, setEmptyVideoPosterUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const hasExternalSourcesRef = useRef(false);
  const remixerIdRef = useRef();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAutoscrollChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAutoscroll(event.target.checked);
  };

  const defaultSources = useMemo(
    () => [ts2timeline(T4), ts2timeline(T5), ts2timeline(T6), ts2timeline(T7), ts2timeline(T8)] as Timeline[],
    [],
  );

  const [sources, dispatchSources] = useReducer((state: any, action: any) => {
    switch (action.type) {
      case 'add':
        return [...state, action.payload];
      case 'remove':
        return state.filter((s: any) => s.metadata.id !== action.payload.id);
      default:
        return state;
    }
  }, []);

  const active = useMemo(() => sources[tabValue]?.metadata?.id, [tabValue, sources]);

  const toggleDrawer = (drawerOpen: boolean) => () => {
    setDrawerOpen(drawerOpen);
  };
  const toggleExportDrawer = (exportDrawerOpen: boolean) => () => {
    setExportDrawerOpen(exportDrawerOpen);
  };

  const remixRef = React.useRef<any>();
  const autoscrollRef = React.useRef<any>();
  const scrollRef = React.useRef<any>();
  // const [css, dispatchCss] = useReducer((state: any, action: any) => ({ ...state, ...action }), {});

  useEffect(() => {
    // Remixer can get the token and URL from the parent window
    // and use that in order to fetch the sources.
    // Otherwise, it will use the default sources.
    const setExternalAPIData = (event: MessageEvent) => {
      const { remixerId, token, url, backgroundColor, videoPosterUrl } = event.data;
      console.log('remixerId', remixerId);
      if (remixerId) {
        remixerIdRef.current = remixerId;
      }
      if (token && url) {
        // Update axios instance with new token and base URL
        axiosInstance.defaults.baseURL = url;
        axiosInstance.defaults.headers['Authorization'] = token;
        hasExternalSourcesRef.current = true;
      }
      if (backgroundColor) {
        document.body.style.backgroundColor = backgroundColor;
      }
      if (videoPosterUrl) {
        setEmptyVideoPosterUrl(videoPosterUrl);
      }
    };

    window.addEventListener('message', setExternalAPIData);

    return () => {
      window.removeEventListener('message', setExternalAPIData);
    };
  }, []);

  useEffect(() => {
    autoscrollRef.current = autoscroll;
  }, [autoscroll]);

  useEffect(() => {
    scrollRef.current = scrolling;
  }, [scrolling]);

  useEffect(() => {
    if (!remixRef.current) return;

    const remixRefCurrent = remixRef.current;
    const listener = remixRefCurrent.addEventListener('playhead', (e: any) => {
      const { pseudo, transcript, section, clip, timedText } = e.detail;
      // console.log('playhead', e.detail);
      const css2: { [key: string]: string } = {};

      const { sid } = section?.metadata?.data ?? { sid: 'default' };
      const sectionEl = document.querySelector(section.metadata.selector);

      if (timedText) {
        const { selector, element } = timedText.metadata;

        const time = element?.getAttribute('data-t')?.split(',')?.[0];
        const players = Array.from(document.querySelectorAll(`div[data-sid="${sid}"] timedtext-player`));
        players.forEach((player) => {
          if (pseudo && autoscrollRef.current) {
            const sourceIndex = sources.findIndex((s: { metadata: { sid: any } }) => s?.metadata?.sid === sid);
            setTabValue(sourceIndex);
          } else {
            // const node = document.querySelector(selector);
            // if (node && autoscrollRef.current)
            //   scrollIntoView(node, {
            //     behavior: 'smooth',
            //   });
          }
          if (pseudo || !time || e.target === player) return;
          (player as any).currentPseudoTime = parseFloat(time);
        });

        const node = sectionEl?.querySelector(clip.metadata.selector);
        // console.log('node', clip.metadata.selector);
        if (node && (autoscrollRef.current || !pseudo) && scrollRef.current) {
          // console.log('scrolling', {
          //   node,
          //   selector: clip.metadata.selector,
          //   autoscroll: autoscrollRef.current,
          //   pseudo,
          // });
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
        css2[transcript] = cssText;
        const style = document.getElementById('injected');
        style!.innerHTML = Object.values(css2).join('\n\n');
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
        },
      },
      // {
      //   name: 'gap',
      //   type: 'gap',
      //   draggable: true,
      //   toolBarComponent: <Chip label="GAP" variant="outlined" />,
      //   // timelineComponent: <FadeInTool />,
      //   timelineComponent: GAPTool,
      //   defaults: {
      //     title: 'GAP',
      //     template: '#fin',
      //     duration: 5,
      //     type: 'gap',
      //   },
      // },
    ],
    [],
  );

  const onTabClose = (e: Event, source: Timeline) => {
    e.stopPropagation();
    dispatchSources({ type: 'remove', payload: { id: source?.metadata?.id } });
  };

  const openTab = async (source: Timeline | ExternalSource) => {
    setDrawerOpen(false);

    if (hasExternalSourcesRef.current) {
      const externalSource = source as ExternalSource;
      const selectedStoryId = externalSource?.id;
      if (!selectedStoryId) return;
      const index = sources.findIndex((s: Timeline) => s?.metadata?.story._id === selectedStoryId);
      if (index >= 0) {
        setTabValue(index);
        return;
      }
      const { data } = await axiosInstance.get(`/remixer/${selectedStoryId}/transcript`);

      const timelineSource = ts2timeline(data);
      dispatchSources({ type: 'add', payload: timelineSource });
      setTabValue(sources.length);
      return;
    }
    const sourceObject = source as Timeline;
    const index = sources.findIndex((s: Timeline) => s?.metadata?.id === sourceObject?.metadata?.id);
    if (index >= 0) {
      setTabValue(index);
    }
    dispatchSources({ type: 'add', payload: source });
    setTabValue(sources.length);
  };

  const saveRemix = useCallback(async () => {
    try {
      setIsSaving(true);
      if (hasExternalSourcesRef.current) {
        await axiosInstance.put(`/remixer/${remixerIdRef.current}`, { data: remix });
      } else {
        localStorage.setItem('remix', JSON.stringify(remix));
      }
      setToastMessage('Remix saved successfully');
    } catch (err) {
      console.log('Error saving remix:', err);
      setToastMessage('Error saving remix');
    } finally {
      setIsSaving(false);
      setToastOpen(true);
    }
  }, [remix]);

  const loadRemix = useCallback(async () => {
    try {
      setIsLoading(true);
      if (hasExternalSourcesRef.current) {
        const response = await axiosInstance.get(`/remixer/${remixerIdRef.current}`);
        const remix2 = response.data;
        if (remix2) setRemix(remix2.data);
        return;
      }

      const remix2 = JSON.parse(localStorage.getItem('remix') || 'null');
      if (remix2) setRemix(remix2);
      setToastMessage('Remix loaded successfully');
      setToastOpen(true);
    } catch {
      setToastMessage('Error loading remix');
      setToastOpen(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (remixerIdRef.current) loadRemix();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadRemix, remixerIdRef.current]);

  const exportRemix = useCallback(() => {
    setIsExporting(true);
    // const html = renderToString(<StaticRemix remix={remix} />);
    // console.log(html);
    setToastMessage('Remix exported successfully');
    setToastOpen(true);
  }, []);

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
  console.log('sources', sources);
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

          #EmptyRemixSource {
            display: flex;
          }

          div[data-rfd-draggable-id="S-EMPTY"] section {
            display: none;
          }

          div[data-rfd-draggable-id="S-EMPTY"] ~ #EmptyRemixDestination {
            display: block;
          }

          div[data-rfd-draggable-id="S-EMPTY"] ~ #EmptyRemixDestination p:first-of-type {
          margin-top: 16px;
          }

          section p {
            cursor: pointer;
            /* content-visibility: auto; */
          }

        `}
      </style>
      {hasExternalSourcesRef.current ? (
        <SourceDrawerExternalApi
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          onClickSource={(source) => openTab(source)}
        />
      ) : (
        <SourceDrawer
          open={drawerOpen}
          onClose={toggleDrawer(false)}
          defaultSources={defaultSources}
          onClickSource={(source) => openTab(source)}
        />
      )}
      <Drawer open={exportDrawerOpen} onClose={toggleExportDrawer(false)} anchor="right">
        {exportDrawerOpen ? <ExportRemix remix={remix} /> : null}
      </Drawer>
      <Box id="container" ref={remixRef} display="flex" justifyContent="center" sx={{ padding: '8px', height: '100%' }}>
        <RemixContext
          sources={sources}
          remix={remix}
          poster={
            emptyVideoPosterUrl ??
            'https://placehold.co/640x360/464C53/7D848A?font=playfair-display&text=TheirStory' ??
            'https://placehold.co/640x360?text=16:9'
          }
          width={620}
          height={360}
          tools={tools}
        >
          <Box id="columns-container" display={'flex'} gap={'8px'} height={'100%'} width={'100%'}>
            <Box
              id="left-column-container"
              borderRadius="8px"
              sx={{ backgroundColor: '#FFFFFF' }}
              padding="16px"
              width="50%"
              maxWidth="45vw"
            >
              <Box id="tabs-container" display="flex">
                <Tabs
                  TabIndicatorProps={{ style: { display: 'none' } }}
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="tabbed content"
                  sx={{
                    maxWidth: '100%',
                    minHeight: '0px',
                    '& .MuiTabs-scrollButtons.Mui-disabled': {
                      width: '0px',
                      visibility: 'hidden',
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
                              {source?.metadata?.story?.title}
                            </Typography>
                            <IconButton sx={{ padding: 0 }} onClick={(e) => onTabClose(e, source)}>
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
              <RemixSources
                active={active}
                PlayerWrapper={LeftPlayerWrapper}
                SourceWrapper={SourceWrapper}
                BlockWrapper={BlockWrapperLeft}
                SelectionWrapper={SelectionWrapper}
                ToolbarWrapper={ToolbarWrapper}
                tools={toolsLeft}
                Empty={() => EmptySourceRemix({ onClick: toggleDrawer(true) })}
              />
            </Box>

            <Box
              id="right-column-container"
              borderRadius="8px"
              sx={{ backgroundColor: '#FFFFFF' }}
              display="flex"
              flexDirection="column"
              paddingX="24px"
              paddingTop="24px"
              width="50%"
              maxWidth="45vw"
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography fontSize="14px" fontWeight={700} lineHeight="20px" color="#464C53">
                  Remix
                </Typography>
                <TopRightIcons
                  handleLoad={loadRemix}
                  handleSave={saveRemix}
                  handleExport={exportRemix}
                  isExporting={isExporting}
                  isLoading={isLoading}
                  isSaving={isSaving}
                />
              </Box>
              <RemixDestination
                PlayerWrapper={RightPlayerWrapper}
                DestinationWrapper={DestinationWrapper}
                SectionContentWrapper={SectionContentWrapper}
                BlockWrapper={BlockWrapperRight}
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
                Empty={isDestinationRemixerEmpty ? EmptyDestinationRemix : undefined}
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
