import { IconButton as MuiIconButton } from '@mui/material';

export const IconButton = ({
  handleClick,
  children,
}: {
  handleClick: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}) => (
  <MuiIconButton
    onClick={handleClick}
    sx={{
      '&:hover': {
        backgroundColor: '#F7F9FC',
      },
      '&:active': {
        backgroundColor: '#F7F9FC',
      },
      borderRadius: '4px',
      padding: '6px',
    }}
  >
    {children}
  </MuiIconButton>
);
