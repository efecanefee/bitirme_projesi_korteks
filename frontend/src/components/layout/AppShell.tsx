import { useState } from 'react';
import { Outlet } from 'react-router';
import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const SIDEBAR_WIDTH = 288;

export function AppShell() {
  const theme = useTheme();
  const masaustu = useMediaQuery(theme.breakpoints.up('md'));
  const [acik, setAcik] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Box
        component="a"
        href="#icerik"
        sx={{ position: 'absolute', left: -9999, '&:focus': { left: 16, top: 16, zIndex: 2000, bgcolor: 'background.paper', color: 'text.primary', p: 1.5, borderRadius: 1 } }}
      >
        İçeriğe geç
      </Box>
      {masaustu ? (
        <Box
          component="aside"
          sx={{ width: SIDEBAR_WIDTH, flexShrink: 0, borderRight: 1, borderColor: 'menu.kenar', bgcolor: 'menu.zemin', position: 'sticky', top: 0, height: '100dvh' }}
        >
          <Sidebar />
        </Box>
      ) : (
        <Drawer open={acik} onClose={() => setAcik(false)} slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH, bgcolor: 'menu.zemin' } } }}>
          <Sidebar onNavigate={() => setAcik(false)} />
        </Drawer>
      )}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar onMenu={() => setAcik(true)} />
        <Box component="main" id="icerik" tabIndex={-1} sx={{ flex: 1, px: { xs: 2, sm: 3, md: 5 }, py: { xs: 3, md: 4 }, outline: 'none' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
