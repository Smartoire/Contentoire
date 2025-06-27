import { AppBar, Toolbar, Typography, Box, IconButton, Menu, MenuItem as MuiMenuItem } from '@mui/material';
import { Menu as MenuIcon, Person } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function Header({ session, router }: { session: any, router: any }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => router.push('/dashboard')}>
          Contentoire
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {session?.user && (
            <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ fontSize: 20 }} />
              {session.user.name}
            </Typography>
          )}
          <IconButton color="inherit" onClick={handleMenu} size="large">
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MuiMenuItem onClick={() => { handleClose(); router.push('/dashboard'); }}>Dashboard</MuiMenuItem>
            <MuiMenuItem onClick={() => { handleClose(); router.push('/settings'); }}>Settings</MuiMenuItem>
            <MuiMenuItem onClick={() => { handleClose(); signOut(); }}>
              <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: 8 }} />
              Sign Out
            </MuiMenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
