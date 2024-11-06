import OpenInBrowserOutlinedIcon from '@mui/icons-material/OpenInBrowserOutlined';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import { Box, Tooltip } from '@mui/material';
import { IconButton } from './IconButton';

const TopRightIcons = ({
  handleLoad,
  handleSave,
  handleExport,
}: {
  handleLoad: () => void;
  handleSave: () => void;
  handleExport: () => void;
}) => {
  return (
    <Box sx={{ display: 'flex', gap: '6px' }}>
      <IconButton aria-label="load-remix" handleClick={handleLoad}>
        <Tooltip title="Load">
          <OpenInBrowserOutlinedIcon style={{ color: '#606971' }} />
        </Tooltip>
      </IconButton>
      <IconButton aria-label="save remix" handleClick={handleSave}>
        <Tooltip title="Save">
          <SaveIcon style={{ color: '#606971' }} />
        </Tooltip>
      </IconButton>
      <IconButton aria-label="export remix" handleClick={handleExport}>
        <Tooltip title="Download">
          <DownloadIcon style={{ color: '#606971' }} />
        </Tooltip>
      </IconButton>
    </Box>
  );
};

export default TopRightIcons;
