import { Menu, MenuItem, Typography, Box } from '@mui/material';
import { CustomSwitch } from './CustomSwitch';

interface SettingsPopUpProps {
  anchorEl: HTMLElement | null;
  handleClose: React.MouseEventHandler<HTMLElement>;
  onToggleAutoScroll: React.MouseEventHandler<HTMLElement>;
  onToggleContextView: React.MouseEventHandler<HTMLElement>;
}

export const SettingsPopUp = ({
  anchorEl,
  handleClose,
  onToggleAutoScroll,
  onToggleContextView,
}: SettingsPopUpProps) => (
  <Menu
    anchorEl={anchorEl}
    open={Boolean(anchorEl)}
    onClose={handleClose}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
  >
    <MenuItem
      onClick={onToggleAutoScroll}
      sx={{
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '16px',
        color: '#606971',
        padding: '12px',
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&:active': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Box display="flex" columnGap="8px" alignItems="center" justifyContent="center">
        <CustomSwitch checked={true} />
        <Typography fontSize="14px" fontWeight={600} lineHeight="16px">
          Auto-scroll
        </Typography>
      </Box>
    </MenuItem>
    <MenuItem
      onClick={onToggleContextView}
      sx={{
        fontSize: '14px',
        fontWeight: 600,
        lineHeight: '16px',
        color: '#606971',
        padding: '12px',
        '&:hover': {
          backgroundColor: 'transparent',
        },
        '&:active': {
          backgroundColor: 'transparent',
        },
      }}
    >
      <Box display="flex" columnGap="8px" alignItems="center" justifyContent="center">
        <CustomSwitch checked={false} />
        <Typography fontSize="14px" fontWeight={600} lineHeight="16px">
          Live context view
        </Typography>
      </Box>
    </MenuItem>
  </Menu>
);
