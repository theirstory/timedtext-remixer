/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, PropsWithChildren, useContext, useState, useCallback } from 'react';
import { renderToString } from 'react-dom/server';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Toolbar,
  Stack,
  Divider,
  Popover,
  MenuList,
  Menu,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import TvOffIcon from '@mui/icons-material/TvOff';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ArrowDropDownRoundedIcon from '@mui/icons-material/ArrowDropDownRounded';
import TextFieldsIcon from '@mui/icons-material/TextFields';

import Timecode from 'smpte-timecode';

import { Context } from '../lib/RemixContext.js';
import { StaticRemix } from '../lib/StaticRemix.js';
import type { Timeline } from '../lib/interfaces';
import { EMPTY_VIDEO } from '../lib/video.js';
import lowerThirdActive from './Assets/lower-third-active.svg';
import lowerThirdInactive from './Assets/lower-third-inactive.svg';
import fullScreenInactive from './Assets/full-screen-inactive.svg';
import fullScreenActive from './Assets/full-screen-active.svg';
import blurLinear from './Assets/blur-linear.svg';
import group from './Assets/group.svg';

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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const id = props.id ?? `FIN-${Date.now()}`;
  const { template } = props;
  const name = props.name ?? 'Fade transition';
  const [openFilterOptions, setOpenFilterOptions] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  // const [currentSelection, setCurrentSelection] = useState(5);

  const [duration, setDuration] = useState<number>(props.duration ?? 5);

  // const handleDurationChange = useCallback(
  //   ({ target: { value } }: SelectChangeEvent<{ value: unknown }>) => setDuration(value as unknown as number),
  //   [],
  // );

  const handleDurationChange = (value) => setDuration(value);

  const handleSave = useCallback(
    () => dispatch({ type: 'metadata', payload: { id, metadata: { id, template, duration } } }),
    [id, template, duration, dispatch],
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleRemove = useCallback(() => {
    dispatch({ type: 'remove', payload: { id } });
    handleClose();
  }, [id, dispatch]);

  return (
    <Box
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      sx={{
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        marginBottom: '12px',
        backgroundColor: isHovered ? '#F7F9FC' : '#FFF',
      }}
      className="widget"
    >
      <Toolbar disableGutters variant="dense" sx={{ paddingX: '12px' }}>
        <DragHandleIcon style={{ marginRight: '8px' }} />
        <img src={blurLinear} style={{ marginRight: '8px' }} />
        <Typography fontSize="12px" fontWeight={700} color="#75808A" component="div" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            opacity: isHovered ? 1 : 0,
            // backgroundColor: isHovered ? '#F7F9FC' : '#FFF',
            // backgroundColor: '#F7F9FC',
          }}
        >
          <IconButton
            className="widget"
            aria-label="delete"
            id="long-button"
            // aria-controls={open ? 'long-menu' : undefined}
            // aria-expanded={open ? 'true' : undefined}
            // aria-haspopup="true"
            onClick={handleRemove}
            sx={{
              backgroundColor: '#F7F9FC',
              '&:hover': {
                backgroundColor: '#e7e9ea',
              },
              '&:active': {
                backgroundColor: '#e7e9ea',
              },
              // minWidth: '0px',
              marginBottom: '0px',
              borderRadius: '4px',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <Divider orientation="vertical" sx={{ marginX: '8px', height: '24px' }} />
          <Box marginLeft="2px !important">
            <Button
              variant="contained"
              disableElevation
              sx={{
                height: '35px',
                textTransform: 'capitalize',
                color: '#606971',
                backgroundColor: '#F7F9FC',
                borderRadius: '8px',
                flex: 1,
                '&:hover': {
                  backgroundColor: '#e7e9ea',
                },
                '&:active': {
                  backgroundColor: '#e7e9ea',
                },
                '&:focus': {
                  outline: 'none',
                },
              }}
              size="small"
              endIcon={<ArrowDropDownRoundedIcon style={{ fontSize: '23px' }} />}
              onClick={(e) => {
                setOpenFilterOptions(e.currentTarget);
              }}
            >
              <Typography
                sx={{ fontSize: '12px', fontWeight: 600, color: '#606971', marginLeft: 0.5, textTransform: 'none' }}
              >
                {duration} sec
              </Typography>
            </Button>
          </Box>
          <Popover
            id="sort-options-popup"
            open={Boolean(openFilterOptions)}
            onClose={() => setOpenFilterOptions(null)}
            anchorEl={openFilterOptions}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MenuList>
              <MenuItem
                sx={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                }}
                onClick={() => {
                  handleDurationChange(5);
                  setOpenFilterOptions(null);
                }}
              >
                5 sec
              </MenuItem>
              <MenuItem
                sx={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                }}
                onClick={() => {
                  handleDurationChange(10);
                  setOpenFilterOptions(null);
                }}
              >
                10 sec
              </MenuItem>
              <MenuItem
                sx={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                }}
                onClick={() => {
                  handleDurationChange(15);
                  setOpenFilterOptions(null);
                }}
              >
                15 sec
              </MenuItem>
            </MenuList>
          </Popover>
        </Box>
        {/* <Select
          value={duration as any}
          label="seconds"
          onChange={handleDurationChange}
          onBlur={handleSave}
          size="small"
          sx={{ border : 'none' }}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
        </Select> */}
      </Toolbar>
    </Box>
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
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const id = props.id ?? `Title-${Date.now()}`;
  const name = props.name ?? 'Title';
  const [title, setTitle] = useState<string>(props.title ?? '');
  const [subtitle, setSubtitle] = useState<string>(props.subtitle ?? '');
  const [template, setTemplate] = useState<string>(props.template ?? '#title-full');
  const [duration, setDuration] = useState<number>(props.duration ?? 5);
  const [openFilterOptions, setOpenFilterOptions] = useState<null | HTMLElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleTitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => setTitle(value),
    [],
  );
  const handleSubtitleChange = useCallback(
    ({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => setSubtitle(value),
    [],
  );
  const handleTemplateChange = useCallback((_event: React.MouseEvent<HTMLElement>, value: string) => {
    console.log(value);
    setTemplate(value);
  }, []);
  // const handleDurationChange = useCallback(
  //   ({ target: { value } }: SelectChangeEvent<{ value: unknown }>) => setDuration(value as unknown as number),
  //   [],
  // );

  const handleDurationChange = (value) => setDuration(value);

  const handleSave = useCallback(
    () => dispatch({ type: 'metadata', payload: { id, metadata: { id, title, subtitle, template, duration } } }),
    [id, title, subtitle, template, duration, dispatch],
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleRemove = useCallback(() => {
    dispatch({ type: 'remove', payload: { id } });
    handleClose();
  }, [id, dispatch]);

  return (
    // <div
    //   style={{
    //     backgroundColor: '#fff',
    //     borderRadius: '8px',
    //     border: '1px solid #D9DCDE',
    //     padding: '12px',
    //     marginBottom: '12px',
    //   }}
    //   className="widget"
    // >
    <Box
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      sx={{
        // backgroundColor: '#FFF',|
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        // padding: '12px',
        marginBottom: '12px',
        padding: '12px',
        // ':&hover': {
        //   backgroundColor: 'blue !important',
        // },
        backgroundColor: isHovered ? '#F7F9FC' : '#FFF',
      }}
      className="widget"
    >
      <Toolbar disableGutters variant="dense" sx={{ minHeight: 0, marginBottom: '16px' }}>
        {/* <TitleIcon /> */}
        <DragHandleIcon style={{ marginRight: '8px' }} />
        <TextFieldsIcon style={{ marginRight: '8px' }} />
        <Typography fontSize="12px" fontWeight={700} color="#75808A" component="div" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            opacity: isHovered ? 1 : 0,
            // backgroundColor: isHovered ? '#F7F9FC' : '#FFF',
            // backgroundColor: '#F7F9FC',
          }}
        >
          <IconButton
            className="widget"
            aria-label="delete"
            id="long-button"
            // aria-controls={open ? 'long-menu' : undefined}
            // aria-expanded={open ? 'true' : undefined}
            // aria-haspopup="true"
            onClick={handleRemove}
            sx={{
              backgroundColor: '#F7F9FC',
              '&:hover': {
                backgroundColor: '#e7e9ea',
              },
              '&:active': {
                backgroundColor: '#e7e9ea',
              },
              // minWidth: '0px',
              marginBottom: '0px',
              borderRadius: '4px',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
          <ToggleButtonGroup value={template} exclusive onChange={handleTemplateChange} onBlur={handleSave}>
            <ToggleButton value="#title-lower3rds" size="small">
              <img src={template === '#title-full' ? lowerThirdInactive : lowerThirdActive} />
            </ToggleButton>
            <ToggleButton value="#title-full" size="small">
              <img src={template === '#title-full' ? fullScreenActive : fullScreenInactive} />
            </ToggleButton>
          </ToggleButtonGroup>
          <Box marginLeft="2px !important">
            <Button
              variant="contained"
              disableElevation
              sx={{
                height: '35px',
                textTransform: 'capitalize',
                color: '#606971',
                backgroundColor: '#F7F9FC',
                borderRadius: '8px',
                flex: 1,
                '&:hover': {
                  backgroundColor: '#e7e9ea',
                },
                '&:active': {
                  backgroundColor: '#e7e9ea',
                },
                '&:focus': {
                  outline: 'none',
                },
              }}
              size="small"
              endIcon={<ArrowDropDownRoundedIcon style={{ fontSize: '23px' }} />}
              onClick={(e) => {
                setOpenFilterOptions(e.currentTarget);
              }}
            >
              <Typography
                sx={{ fontSize: '12px', fontWeight: 600, color: '#606971', marginLeft: 0.5, textTransform: 'none' }}
              >
                {duration} sec
              </Typography>
            </Button>
          </Box>
          <Popover
            id="sort-options-popup"
            open={Boolean(openFilterOptions)}
            onClose={() => setOpenFilterOptions(null)}
            anchorEl={openFilterOptions}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MenuList sx={{ backgroundColor: '#F7F9FC' }}>
              <MenuItem
                sx={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                }}
                onClick={() => {
                  handleDurationChange(5);
                  setOpenFilterOptions(null);
                }}
              >
                5 sec
              </MenuItem>
              <MenuItem
                sx={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                }}
                onClick={() => {
                  handleDurationChange(10);
                  setOpenFilterOptions(null);
                }}
              >
                10 sec
              </MenuItem>
              <MenuItem
                sx={{
                  width: '120px',
                  fontSize: '14px',
                  fontWeight: 400,
                  lineHeight: '20px',
                }}
                onClick={() => {
                  handleDurationChange(15);
                  setOpenFilterOptions(null);
                }}
              >
                15 sec
              </MenuItem>
            </MenuList>
          </Popover>
        </Box>
        {/* <Select
          value={duration as any}
          label="seconds"
          onChange={handleDurationChange}
          onBlur={handleSave}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
        </Select> */}
        {/* <IconButton
          className="widget"
          aria-label="more"
          id="long-button"
          aria-controls={open ? 'long-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton> */}
        {/* <Menu
          className="widget"
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
        </Menu> */}
      </Toolbar>
      <TextField
        label="Title"
        value={title}
        style={{ width: '100%', marginBottom: '16px', backgroundColor: '#fff' }}
        onChange={handleTitleChange}
        onBlur={handleSave}
        size="small"
      />
      <TextField
        label="Subtitle (optional)"
        value={subtitle}
        style={{ width: '100%', backgroundColor: '#fff' }}
        onChange={handleSubtitleChange}
        onBlur={handleSave}
        size="small"
      />
      {/* // </div> */}
    </Box>
  );
};

export const GAPTool = (props: { id?: string; name?: string; template?: string; stack?: Stack }): JSX.Element => {
  const { dispatch } = useContext(Context);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const id = props.id;
  const stack = props.stack;
  const name = 'GAP';

  const [duration, setDuration] = useState<number>(stack?.source_range?.duration ?? 5);

  const handleDurationChange = useCallback(
    ({ target: { value } }: SelectChangeEvent<{ value: unknown }>) => {
      setDuration(value as unknown as number);
      dispatch({ type: 'change-duration', payload: { id, duration: value as unknown as number } });
    },
    [id, dispatch],
  );

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
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
    <div
      style={{
        backgroundColor: '#a3ebbf',
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        padding: '12px',
        marginBottom: '12px',
      }}
      className="widget"
    >
      <Toolbar disableGutters variant="dense">
        <TvOffIcon />
        &nbsp;&nbsp;
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        <Select
          value={duration as any}
          label="seconds"
          onChange={handleDurationChange}
          // onBlur={handleSave}
          size="small"
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={15}>15</MenuItem>
        </Select>
        &nbsp;&nbsp;&nbsp;
        <Divider orientation="vertical" flexItem />
        &nbsp;&nbsp;
        <IconButton
          className="widget"
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
          className="widget"
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
  );
};

// Wrappers

const EMPTY_REMIX_SX = {
  height: '100%',
  borderRadius: '8px',
  display: 'flex',
  flexDirection: 'column',
  textAlign: '-webkit-center',
  paddingY: '51px',
};

export const EmptyRemix = (): JSX.Element => (
  <Box id="EmptyRemix" sx={EMPTY_REMIX_SX}>
    <Box borderRadius="96px" padding="32px" marginBottom="16px" width="fit-content" sx={{ backgroundColor: '#F7F9FC' }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="52" height="51" viewBox="0 0 52 51" fill="none">
        <g clip-path="url(#clip0_1412_3498)">
          <path
            d="M36.3198 25.1551V38.0581L30.5313 32.421C30.0687 31.9705 29.3096 31.9705 28.847 32.421C28.3843 32.8715 28.3843 33.5992 28.847 34.0497L36.6638 41.6621C37.1264 42.1126 37.8736 42.1126 38.3362 41.6621L46.153 34.0497C46.6157 33.5992 46.6157 32.8715 46.153 32.421C45.6904 31.9705 44.9432 31.9705 44.4806 32.421L38.6921 38.0581V25.1551C38.6921 24.5198 38.1583 24 37.5059 24C36.8535 24 36.3198 24.5198 36.3198 25.1551Z"
            fill="#606971"
          />
          <path
            d="M6.9375 10H41.0625C42.4031 10 43.5 11.125 43.5 12.5C43.5 13.875 42.4031 15 41.0625 15H6.9375C5.59687 15 4.5 13.875 4.5 12.5C4.5 11.125 5.59687 10 6.9375 10ZM6.9375 20H26.4375C27.7781 20 28.875 21.125 28.875 22.5C28.875 23.875 27.7781 25 26.4375 25H6.9375C5.59687 25 4.5 23.875 4.5 22.5C4.5 21.125 5.59687 20 6.9375 20Z"
            fill="#606971"
          />
        </g>
        <defs>
          <clipPath id="clip0_1412_3498">
            <rect width="51" height="51" fill="white" transform="translate(0.5)" />
          </clipPath>
        </defs>
      </svg>
    </Box>
    <Typography color="#75808A" fontSize="14px" fontWeight={600} lineHeight="20px">
      Select text from a transcription <br />
      and click "Add to remix" or drag it <br />
      here to begin your remix.
    </Typography>
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
    marginTop="8px"
    borderRadius="8px"
    // sx={{ backgroundColor: '#8E979F', textAlign: 'center', width: '100%', aspectRatio: '16/9' }}
    sx={{
      backgroundColor: '#464C53',
      textAlign: 'center',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '16px',
    }}
    // sx={{ backgroundColor: '#8E979F', textAlign: 'center', width: '100%', aspectRatio: '16/9' }}
  >
    {children}
  </Box>
);

export const RightPlayerWrapper = ({ children }: PropsWithChildren): JSX.Element => (
  <Box
    id="rightPlayerWrapper"
    marginTop="4px"
    borderRadius="8px"
    sx={{ backgroundColor: '#464C53', textAlign: 'center', width: 'auto' }}
  >
    {children}
  </Box>
);

// Left transcript
export const SourceWrapper = ({ children }: PropsWithChildren): JSX.Element => {
  const sx = useMemo(
    () => ({
      backgroundColor: '#FFFFFF',
      // paddingY: '16px',
      // marginTop: '16px',
      maxHeight: 'calc(100vh - 420px)',
      overflowY: 'auto',
      borderRadius: '8px',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#606971',
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      // paddingY: '16px',
      // marginTop: '16px',
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
      minHeight: 'calc(100vh - 622px)',
      maxHeight: 'calc(100vh - 455px)',
      paddingRight: '4px',
      height: '100%',
      overflowY: 'auto',
      '&::-webkit-scrollbar': {
        width: '8px',
      },
      '&::-webkit-scrollbar-thumb': {
        background: '#606971',
        borderRadius: '10px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
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
        <div
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            left: 0,
            top: -35,
            borderRadius: '4px',
            boxShadow:
              '0px 5px 5px -3px rgba(0, 0, 0, 0.20), 0px 8px 10px 1px rgba(0, 0, 0, 0.14), 0px 3px 14px 2px rgba(0, 0, 0, 0.12)',
          }}
        >
          <IconButton
            className="widget"
            aria-label="add to remix"
            onClick={handleAdd}
            sx={{
              '&:hover': {
                backgroundColor: '#F7F9FC',
              },
              '&:active': {
                backgroundColor: '#F7F9FC',
              },
              padding: '10px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              columnGap: '8px',
            }}
          >
            <PlaylistAddIcon style={{ color: '#606971' }} />
            <Typography
              style={{
                color: '#606971',
                fontSize: '12px',
                fontWeight: 600,
                lineHeight: '16px',
                whiteSpace: 'nowrap',
              }}
            >
              Add to remix
            </Typography>
          </IconButton>
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
    <div className="BlockWrapper" style={{ margin: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={USER_SELECT_NONE}>
        <small style={{ display: 'flex', alignItems: 'center', columnGap: '8px' }}>
          <code
            style={{ color: '#6E767E', fontStyle: 'normal', fontSize: '14px', fontWeight: 600, lineHeight: 'normal' }}
          >
            {timecode}
          </code>{' '}
          <p
            style={{
              margin: 0,
              color: '#323232',
              fontStyle: 'normal',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: 'normal',
            }}
          >
            {speaker}
          </p>
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
  const [isHovered, setIsHovered] = useState(false);

  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
    SectionContentWrapper;
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
    <Box
      // onMouseEnter={() => setIsHovered(true)}
      // onMouseLeave={() => setIsHovered(false)}
      sx={{
        // backgroundColor: '#FFF',|
        borderRadius: '8px',
        border: '1px solid #D9DCDE',
        // padding: '12px',
        marginBottom: '12px',
        padding: '12px',
        // ':&hover': {
        //   backgroundColor: 'blue !important',
        // },
        backgroundColor: isHovered ? '#F7F9FC' : '#FFF',
      }}
      // className="widget"
      className="SectionContentWrapper"
    >
      <div style={{ userSelect: 'none' }}>
        <Toolbar disableGutters variant="dense" sx={{ minHeight: 0, marginBottom: '8px' }}>
          <DragHandleIcon style={{ marginRight: '8px' }} />
          <Typography fontSize="12px" fontWeight={700} color="#75808A" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <IconButton
              className="widget"
              aria-label="delete"
              onClick={handleRemove}
              sx={{
                backgroundColor: '#F7F9FC',
                '&:hover': {
                  backgroundColor: '#e7e9ea',
                },
                '&:active': {
                  backgroundColor: '#e7e9ea',
                },
                padding: '2px',
                marginBottom: '0px',
                borderRadius: '4px',
              }}
            >
              <Tooltip title="Delete">
                <DeleteIcon fontSize="small" />
              </Tooltip>
            </IconButton>
          </Box>
          <IconButton
            className="widget"
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
            className="widget"
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
              <Typography variant="inherit">Move up</Typography>
            </MenuItem>
            <MenuItem onClick={handleMoveDown}>
              <ListItemIcon>
                <ArrowDownwardIcon fontSize="small" />
              </ListItemIcon>
              <Typography variant="inherit">Move down</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </div>
      {children}
      {/* </div> */}
    </Box>
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
