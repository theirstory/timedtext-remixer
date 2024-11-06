import OpenInBrowserOutlinedIcon from '@mui/icons-material/OpenInBrowserOutlined';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import { Box } from '@mui/material';
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
    <Box sx={{ display: 'flex', gap: '6px', color: '#606971' }}>
      <IconButton aria-label="load-remix" handleClick={handleLoad}>
        <OpenInBrowserOutlinedIcon />
      </IconButton>
      <IconButton aria-label="save remix" handleClick={handleSave}>
        <SaveIcon />
      </IconButton>
      <IconButton aria-label="export remix" handleClick={handleExport}>
        <DownloadIcon />
      </IconButton>
    </Box>
  );
};

export default TopRightIcons;
