import OpenInBrowserOutlinedIcon from '@mui/icons-material/OpenInBrowserOutlined';
import SaveIcon from '@mui/icons-material/Save';
import DownloadIcon from '@mui/icons-material/Download';
import { Box, CircularProgress, Tooltip } from '@mui/material';
import { IconButton } from './IconButton';

const TopRightIcons = ({
  handleLoad,
  handleSave,
  handleExport,
  isLoading,
  isSaving,
  isExporting,
}: {
  handleLoad: () => void;
  handleSave: () => void;
  handleExport: () => void;
  isLoading: boolean;
  isSaving: boolean;
  isExporting: boolean;
}) => {
  return (
    <Box sx={{ display: 'flex', gap: '6px' }} alignItems="center" justifyContent="center">
      {isLoading ? (
        <Box width="36px" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress sx={{ color: '#239b8b' }} size={20} />
        </Box>
      ) : (
        <IconButton aria-label="load-remix" handleClick={handleLoad}>
          <Tooltip title="Load">
            <OpenInBrowserOutlinedIcon style={{ color: '#606971' }} />
          </Tooltip>
        </IconButton>
      )}
      {isSaving ? (
        <Box width="36px" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress sx={{ color: '#239b8b' }} size={20} />
        </Box>
      ) : (
        <IconButton aria-label="save remix" handleClick={handleSave}>
          <Tooltip title="Save">
            <SaveIcon style={{ color: '#606971' }} />
          </Tooltip>
        </IconButton>
      )}
      {isExporting ? (
        <Box width="36px" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress sx={{ color: '#239b8b' }} size={20} />
        </Box>
      ) : (
        <IconButton aria-label="export remix" handleClick={handleExport}>
          <Tooltip title="Download">
            <DownloadIcon style={{ color: '#606971' }} />
          </Tooltip>
        </IconButton>
      )}
    </Box>
  );
};

export default TopRightIcons;
