/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, PropsWithChildren, useContext, useState, useCallback } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  Select,
  Menu,
  MenuItem,
  ListItemIcon,
  ToggleButtonGroup,
  ToggleButton,
  SelectChangeEvent,
  Toolbar,
  Tooltip,
  Stack,
  Divider,
} from '@mui/material';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import TitleIcon from '@mui/icons-material/Title';
import FlipIcon from '@mui/icons-material/Flip';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ShortTextIcon from '@mui/icons-material/ShortText';
import SubjectIcon from '@mui/icons-material/Subject';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import Timecode from 'smpte-timecode';

import { Context } from '../lib/RemixContext.js';
import { StaticRemix } from '../lib/StaticRemix.js';
import type { Timeline } from '../lib/interfaces';

export const TEMPLATES = `
  <template id="video1">
    <video src="\${src}" disablePictureInPicture controlsList="nodownload">
    </video>
  </template>

  <template id="fin">
    <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color:  rgba(0, 0, 0, calc(1 - \${progress}));">
    </div>
  </template>

  <template id="fin-reverse">
    <div style="position: absolute; top: 0; left: 0; height: 100%; width: 100%; background-color:  rgba(0, 0, 0, \${progress});">
    </div>
  </template>

  <template id="title-full">
    <div class="title-full" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: center; margin-top: 30%;">\${title}</h2>
      <h3 style="color: white; text-align: center;">\${subtitle}</h3>
      <style>
        .title-full {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>

  <template id="title-full-reverse">
    <div class="title-full" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: center; margin-top: 30%;">\${title}</h2>
      <h3 style="color: white; text-align: center;">\${subtitle}</h3>
      <style>
        .title-full {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>

  <template id="title-lower3rds">
    <div class="title-lower3rds" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 33%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${title}</h2>
      <h3 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${subtitle}</h3>
      <style>
        .title-lower3rds {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>

  <template id="title-lower3rds-reverse">
    <div class="title-lower3rds" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 33%; background-color: rgba(0, 0, 0, .7);">
      <h2 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${title}</h2>
      <h3 style="color: white; text-align: left; padding-left: 20px; margin-left: 0">\${subtitle}</h3>
      <style>
        .title-lower3rds {
          container-type: size;
          _opacity: \${fadeIn};
        }

        @container (min-width: 1500px) {
          h3 {
            color: red !important;
          }
        }
      </style>
    </div>
  </template>
`;

// Tools
export const FadeInTool = (props: {
  id?: string;
  name?: string;
  template?: string;
  duration?: number;
}): JSX.Element => {
  const { dispatch } = useContext(Context);
  const id = props.id ?? `FIN-${Date.now()}`;
  const { template } = props;
  const name = props.name ?? 'Fade';

  const [duration, setDuration] = useState<number>(props.duration ?? 5);

  const handleDurationChange = useCallback(
    ({ target: { value } }: SelectChangeEvent<{ value: unknown }>) => setDuration(value as unknown as number),
    [],
  );
  const handleSave = useCallback(
    () => dispatch({ type: 'metadata', payload: { id, metadata: { id, template, duration } } }),
    [id, template, duration, dispatch],
  );
  const handleRemove = useCallback(() => dispatch({ type: 'remove', payload: { id } }), [id, dispatch]);

  return (
    <div
      style={{
        backgroundColor: '#c1d8fb',
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        padding: '12px',
        marginBottom: '12px',
      }}
      className="widget"
    >
      <Toolbar disableGutters variant="dense">
        <FlipIcon />
        &nbsp;&nbsp;
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <Select
          value={duration as any}
          label="seconds"
          onChange={handleDurationChange}
          onBlur={handleSave}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
        </Select>
        &nbsp;&nbsp;&nbsp;
        <Divider orientation="vertical" flexItem />
        &nbsp;&nbsp;
        <Tooltip title="Delete">
          <IconButton onClick={handleRemove} size="small">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
    </div>
  );
};

export const TitleTool = (props: {
  id?: string;
  name?: string;
  title?: string;
  subtitle?: string;
  template?: string;
  duration?: number;
}): JSX.Element => {
  const { dispatch } = useContext(Context);
  const id = props.id ?? `Title-${Date.now()}`;
  const name = props.name ?? 'Title';
  const [title, setTitle] = useState<string>(props.title ?? '');
  const [subtitle, setSubtitle] = useState<string>(props.subtitle ?? '');
  const [template, setTemplate] = useState<string>(props.template ?? '#title-full');
  const [duration, setDuration] = useState<number>(props.duration ?? 5);

  const handleTitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => setTitle(value),
    [],
  );
  const handleSubtitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => setSubtitle(value),
    [],
  );
  const handleTemplateChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, value: string) => setTemplate(value),
    [],
  );
  const handleDurationChange = useCallback(
    ({ target: { value } }: SelectChangeEvent<{ value: unknown }>) => setDuration(value as unknown as number),
    [],
  );
  const handleSave = useCallback(
    () => dispatch({ type: 'metadata', payload: { id, metadata: { id, title, subtitle, template, duration } } }),
    [id, title, subtitle, template, duration, dispatch],
  );
  const handleRemove = useCallback(() => dispatch({ type: 'remove', payload: { id } }), [id, dispatch]);

  return (
    <div
      style={{
        backgroundColor: '#fbffe6',
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        padding: '12px',
        marginBottom: '12px',
      }}
      className="widget"
    >
      <Toolbar disableGutters variant="dense">
        <TitleIcon />
        &nbsp;&nbsp;
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <ToggleButtonGroup value={template} exclusive onChange={handleTemplateChange} onBlur={handleSave}>
          <ToggleButton value="#title-lower3rds" size="small">
            <ShortTextIcon />
          </ToggleButton>
          <ToggleButton value="#title-full" size="small">
            <SubjectIcon />
          </ToggleButton>
        </ToggleButtonGroup>
        <Select
          value={duration as any}
          label="seconds"
          onChange={handleDurationChange}
          onBlur={handleSave}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
        </Select>
        &nbsp;&nbsp;&nbsp;
        <Divider orientation="vertical" flexItem />
        &nbsp;&nbsp;
        <Tooltip title="Delete">
          <IconButton onClick={handleRemove} size="small">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Toolbar>
      <TextField
        label="Title"
        value={title}
        style={{ width: '100%' }}
        onChange={handleTitleChange}
        onBlur={handleSave}
        size="small"
      />
      &nbsp;
      <TextField
        label="Subtitle"
        value={subtitle}
        style={{ width: '100%' }}
        onChange={handleSubtitleChange}
        onBlur={handleSave}
        size="small"
      />
    </div>
  );
};

// Wrappers

const EMPTY_REMIX_SX = {
  height: '302px',
  borderRadius: '8px',
  backgroundColor: '#f6e52c',
  textAlign: 'center',
};

export const EmptyRemix = (): JSX.Element => (
  <Box id="EmptyRemix" sx={EMPTY_REMIX_SX}>
    <Typography>TheirStory</Typography>
    <p>Drop here</p>
  </Box>
);

// export const EmptyPlayer = (): JSX.Element => (
//   <Box id="EmptyPlayer" height="302px" borderRadius="8px" sx={{ backgroundColor: '#464C53', textAlign: 'center' }}>
//     <Typography>TheirStory</Typography>
//   </Box>
// );

export const LeftPlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="leftPlayerWrapper"
    marginTop="16px"
    borderRadius="8px"
    sx={{ backgroundColor: '#8E979F', textAlign: 'center', width: '100%', aspectRatio: '16/9' }}
  >
    {children}
  </Box>
);

export const RightPlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="rightPlayerWrapper"
    marginTop="16px"
    borderRadius="8px"
    sx={{ backgroundColor: '#8E979F', textAlign: 'center', width: '100%', aspectRatio: '16/9' }}
  >
    {children}
  </Box>
);

// Left transcript
export const SourceWrapper = ({ children }: PropsWithChildren): JSX.Element => {
  const sx = useMemo(
    () => ({
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
    }),
    [],
  );

  return (
    <Box id="sourceWrapper" sx={sx}>
      {children}
    </Box>
  );
};

// Right transcript
export const DestinationWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="destinationWrapper"
    sx={{
      backgroundColor: '#FFFFFF',
      paddingY: '16px',
      maxHeight: 'calc(100vh - 622px)',
      minHeight: 'calc(100vh - 622px)',
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

interface SelectionWrapperProps extends PropsWithChildren {
  metadata?: { [key: string]: any };
  first?: boolean;
  droppableId?: string;
  source: Timeline;
}

export const SelectionWrapper = ({ first, droppableId, source, children }: SelectionWrapperProps): JSX.Element => {
  const { dispatch, remixPlayerRef } = useContext(Context);

  const handleAdd = useCallback(() => {
    if (!droppableId || !(remixPlayerRef as any).current) return;

    const [, , start, end] = droppableId.split('-');

    const sectionId = (remixPlayerRef as any).current?.getCurrentSection()?.metadata?.id;
    if (sectionId) {
      dispatch({ type: 'add-at', payload: [sectionId, source, [parseFloat(start), parseFloat(end)]] });
    } else {
      const result = { destination: { index: 0 } };
      dispatch({ type: 'add', payload: [result, source, [parseFloat(start), parseFloat(end)]] });
    }
  }, [dispatch, droppableId, source, remixPlayerRef]);

  return (
    <span className="SelectionWrapper" style={{ backgroundColor: '#d3ebe8', position: 'relative' }}>
      {first ? (
        <div style={{ backgroundColor: 'white', position: 'absolute', left: 0, top: -35 }}>
          <Button
            variant="outlined"
            startIcon={<PlaylistAddIcon />}
            onClick={handleAdd}
            style={{ textTransform: 'none', textWrap: 'nowrap' }}
          >
            Add to remix
          </Button>
        </div>
      ) : null}
      {children}
    </span>
  );
};

export const ToolbarWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Toolbar disableGutters variant="dense">
    <Stack direction="row" spacing={1}>
      {children}
    </Stack>
  </Toolbar>
);

// Paragraph wrapper
interface BlockWrapperProps extends PropsWithChildren {
  metadata?: { [key: string]: any };
  start?: number;
  offset?: number;
}

const USER_SELECT_NONE: React.CSSProperties = { userSelect: 'none' };

export const BlockWrapperLeft = ({ start = 0, offset = 0, metadata, children }: BlockWrapperProps): JSX.Element => {
  const {
    data: { t },
    speaker,
  } = metadata ?? { data: { t: '' }, speaker: '' };
  const timecode = useMemo(() => {
    const [pStart = 0] = t.split(',').map(parseFloat);
    return new Timecode((pStart - start + offset) * 30, 30).toString().split(':').slice(0, 3).join(':');
  }, [t, start, offset]);
  return (
    <div className="BlockWrapper">
      <div style={USER_SELECT_NONE}>
        <small>
          <code>{timecode}</code> {speaker}
        </small>
      </div>
      {children}
    </div>
  );
};

export const BlockWrapperRight = ({ children }: BlockWrapperProps): JSX.Element => (
  <div className="BlockWrapper">{children}</div>
);

interface SectionContentWrapperProps extends PropsWithChildren {
  metadata?: { [key: string]: any };
}

const ITEM_HEIGHT = 48;

export const SectionContentWrapper = ({ metadata, children }: SectionContentWrapperProps): JSX.Element => {
  const { dispatch } = useContext(Context);
  const { id, title } = metadata ?? { title: 'No title?' };
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleRemove = useCallback(() => {
    dispatch({ type: 'remove', payload: { id } });
    handleClose();
  }, [id, dispatch]);
  const handleMoveUp = useCallback(() => {
    dispatch({ type: 'move-up', payload: { id } });
    handleClose();
  }, [id, dispatch]);
  const handleMoveDown = useCallback(() => {
    dispatch({ type: 'move-down', payload: { id } });
    handleClose();
  }, [id, dispatch]);

  return (
    <div className="SectionContentWrapper">
      <div style={{ userSelect: 'none' }}>
        <Toolbar disableGutters variant="dense">
          <AutoStoriesIcon />
          &nbsp;&nbsp;
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Divider orientation="vertical" flexItem />
          &nbsp;&nbsp;
          <IconButton
            aria-label="more"
            id="long-button"
            aria-controls={open ? 'long-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleClick}
          >
            <MoreVertIcon />
          </IconButton>
          <Menu
            id="long-menu"
            MenuListProps={{
              'aria-labelledby': 'long-button',
            }}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            slotProps={{
              paper: {
                style: {
                  maxHeight: ITEM_HEIGHT * 4.5,
                  width: '20ch',
                },
              },
            }}
          >
            <MenuItem onClick={handleMoveUp}>
              <ListItemIcon>
                <ArrowUpwardIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">move up</Typography>
            </MenuItem>
            <MenuItem onClick={handleMoveDown}>
              <ListItemIcon>
                <ArrowDownwardIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">move down</Typography>
            </MenuItem>
            <MenuItem onClick={handleRemove}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">delete</Typography>
            </MenuItem>
          </Menu>

        </Toolbar>
      </div>
      {children}
    </div>
  );
};

// Not used yet
// const ToolBarWrapper = ({ children }: PropsWithChildren): JSX.Element => (
//   <div className="ToolBarWrapper" style={{ border: '1px solid green' }}>
//     {children}
//   </div>
// );

export const ExportRemix = ({ remix }: { remix: Timeline }) => {
  const html = useMemo(
    () =>
      renderToString(<StaticRemix remix={remix} templates={TEMPLATES} />)
        .replace('<timedtext-player ', '<timedtext-player slot="media" ')
        .replaceAll(' suppresshydrationwarning=""', ''),
    [remix],
  );
  return (
    <div style={{ padding: 10 }}>
      <TextField label="HTML" multiline value={html} />
    </div>
  );
};
