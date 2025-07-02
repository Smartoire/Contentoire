import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Box, Typography, Button, AppBar, Toolbar, Container, Menu, MenuItem, IconButton } from '@mui/material';
import { Settings, Person, Menu as MenuIcon } from '@mui/icons-material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

// Add icons to the library
library.add(faSignOutAlt);

// Header component with menu
function Header({ session, router }: { session: any, router: any }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const pathname = usePathname();

  useEffect(() => {
    console.log('Current path:', pathname);
  }, [pathname]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

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
            <MenuItem onClick={() => { handleClose(); router.push('/dashboard'); }}>Dashboard</MenuItem>
            <MenuItem onClick={() => { handleClose(); router.push('/settings'); }}>Settings</MenuItem>
            <MenuItem onClick={() => { handleClose(); signOut(); }}>
              <FontAwesomeIcon icon={faSignOutAlt} style={{ marginRight: 8 }} />
              Sign Out
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default function Dashboard() {
  console.log('Dashboard page mounted');
  
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  
  console.log('Dashboard page - Router:', router);
  console.log('Dashboard page - Pathname:', pathname);
  console.log('Dashboard page - Session:', session);
  console.log('Dashboard page - Base path:', process.env.NEXT_PUBLIC_BASE_PATH || '/contentoire');

  useEffect(() => {
    if (session === null) {
      if (typeof window !== 'undefined') {
        router.push('/auth/signin');
      }
    }
  }, [session, router]);

  // Check if we're on the correct path
  useEffect(() => {
    console.log('Dashboard page - useEffect triggered');
    console.log('Current path:', pathname);
    
    if (pathname !== '/contentoire/dashboard') {
      console.log('Redirecting to correct dashboard path');
      router.push('/contentoire/dashboard');
    }
  }, [pathname, router]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header session={session} router={router} />
      <Container sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
