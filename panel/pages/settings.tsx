import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession, signOut } from 'next-auth/react';
import { Box, Typography, Tabs, Tab, Paper, Avatar, IconButton, Dialog, DialogTitle, DialogContent, TextField, Button, Switch } from '@mui/material';
import Header from './components/Header';
import ProviderCard from './components/ProviderCard';
import { newsProviders } from './providers/newsProviders';
import { authProviders } from './providers/authProviders';
import { contentProviders } from './providers/contentProviders';
import { socialMedias } from './providers/socialProviders';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import LockIcon from '@mui/icons-material/Lock';
import GroupIcon from '@mui/icons-material/Group';
import ShareIcon from '@mui/icons-material/Share';

// Remove newsSourceModules, dummyUsers, etc. from this file

export default function SettingsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  const [newSource, setNewSource] = useState({
    id: '',
    name: '',
    url: '',
    authType: 'basic',
    authConfig: {},
    isActive: true,
    categories: []
  });

  const [tab, setTab] = useState(0);
  const [editProvider, setEditProvider] = useState<string | null>(null);
  const [providerKeys, setProviderKeys] = useState<Record<string, { clientId: string; clientSecret: string }>>({
    google: { clientId: '', clientSecret: '' },
    facebook: { clientId: '', clientSecret: '' },
    apple: { clientId: '', clientSecret: '' },
    twitter: { clientId: '', clientSecret: '' },
    linkedin: { clientId: '', clientSecret: '' },
  });
  const [editUser, setEditUser] = useState<any>(null);

  // For editing a news source's settings
  const [editNewsSource, setEditNewsSource] = useState<any>(null);

  // Check if user is global admin
  const isGlobalAdmin = session?.user?.role === 'global_admin';

  useEffect(() => {
    if (session && !isGlobalAdmin) {
      router.push('/dashboard');
    }
  }, [session, isGlobalAdmin, router]);

  if (!settings) return <div>Loading...</div>;

  useEffect(() => {
    // Fetch settings configuration from API
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) {
          throw new Error('Failed to fetch settings');
        }
        const data = await response.json();
        setSettings(data);
        // Also fetch users if available in the settings
        if (data.users) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error('Error fetching settings:', error instanceof Error ? error.message : error);
      }
    };
    if (isGlobalAdmin) {
      fetchSettings();
    }
  }, [session, isGlobalAdmin, router]);

  if (!settings) return <div>Loading...</div>;

  // Rest of the component code here...

  // Loading state
  if (!session) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!isGlobalAdmin) {
    return null;
  }

  // Add Source Handler
  const handleAddSource = async () => {
    try {
      const response = await fetch('/api/settings/news-sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSource)
      });

      if (!response.ok) {
        throw new Error('Failed to add news source');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        newsSources: [...prev.newsSources, data]
      }));
      setOpenAddDialog(false);
      setNewSource({
        id: '',
        name: '',
        url: '',
        authType: 'basic',
        authConfig: {},
        isActive: true,
        categories: []
      });
    } catch (error) {
      console.error('Error adding source:', error);
    }
  };

  // Toggle Source Handler
  const handleToggleSource = async (id: string) => {
    try {
      const response = await fetch(`/api/settings/news-sources/${id}/toggle`, {
        method: 'PUT'
      });
      
      if (!response.ok) {
        throw new Error('Failed to toggle source');
      }

      const data = await response.json();
      setSettings(prev => ({
        ...prev,
        newsSources: prev.newsSources.map(source => 
          source.id === id ? data : source
        )
      }));
    } catch (error) {
      console.error('Error toggling source:', error instanceof Error ? error.message : 'An unknown error occurred');
    }
  };

  // Handlers for editing provider keys
  const handleProviderEditOpen = (id: string) => setEditProvider(id);
  const handleProviderEditClose = () => setEditProvider(null);
  const handleProviderKeyChange = (id: string, field: 'clientId' | 'clientSecret', value: string) => {
    setProviderKeys(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Save provider keys to the database
  const handleProviderKeySave = async (providerId: string) => {
    try {
      const res = await fetch('/api/settings/auth-provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: providerId,
          clientId: providerKeys[providerId].clientId,
          clientSecret: providerKeys[providerId].clientSecret,
        }),
      });
      if (!res.ok) throw new Error('Failed to save provider keys');
      // Optionally show a success message here
    } catch (err) {
      console.error('Error saving provider keys:', err);
    }
  };

  // Provider enabled/disabled state
  const [providerEnabled, setProviderEnabled] = useState<Record<string, boolean>>({
    google: true,
    facebook: true,
    apple: true,
    twitter: true,
    linkedin: true,
  });

  // Save provider enabled/disabled state to the database
  const handleProviderToggle = async (providerId: string, enabled: boolean) => {
    setProviderEnabled(prev => ({ ...prev, [providerId]: enabled }));
    try {
      await fetch('/api/settings/auth-provider-enabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: providerId, enabled }),
      });
    } catch (err) {
      console.error('Error saving provider enabled state:', err);
    }
  };

  // News source enabled/disabled state
  const [newsSourceEnabled, setNewsSourceEnabled] = useState<Record<string, boolean>>({
    currentsapi: true,
    newsapiorg: true,
    newsdataio: true,
    worldnewsapi: true,
  });

  // Save news source enabled/disabled state to the database
  const handleNewsSourceToggle = async (sourceId: string, enabled: boolean) => {
    setNewsSourceEnabled(prev => ({ ...prev, [sourceId]: enabled }));
    try {
      await fetch('/api/settings/news-source-enabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceId, enabled }),
      });
    } catch (err) {
      console.error('Error saving news source enabled state:', err);
    }
  };

  // Handler for editing user (dummy)
  const handleUserEditOpen = (user: any) => setEditUser(user);
  const handleUserEditClose = () => setEditUser(null);

  // Unified handler for toggling provider/news source/user/social media enabled state
  const handleToggle = (id: string, enabled: boolean) => {
    // Only call hooks and state setters unconditionally at the top level!
    if (providerEnabled.hasOwnProperty(id)) {
      handleProviderToggle(id, enabled);
    } else if (newsSourceEnabled.hasOwnProperty(id)) {
      handleNewsSourceToggle(id, enabled);
    }
    // Add more logic for user/social media if needed
  };

  return (
    <Box sx={{ p: 3 }}>
      <Header session={session} router={router} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        {isGlobalAdmin && (
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NewspaperIcon fontSize="small" />
                News Providers
              </Box>
            }
          />
        )}
        {isGlobalAdmin && (
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockIcon fontSize="small" />
                Auth Providers
              </Box>
            }
          />
        )}
        {isGlobalAdmin && (
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupIcon fontSize="small" />
                Content Providers
              </Box>
            }
          />
        )}
        <Tab
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ShareIcon fontSize="small" />
              Social Media
            </Box>
          }
        />
      </Tabs>

      {/* News Sources Tab */}
      {tab === 0 && isGlobalAdmin && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            News Providers
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {newsProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                logo={provider.logo}
                title={provider.title}
                id={provider.id}
                enabled={!!newsSourceEnabled[provider.id]}
                onToggle={handleToggle}
                onEdit={() => setEditNewsSource(provider.instance)}
              />
            ))}
          </Box>
          {/* Edit News Source Settings Dialog */}
          <Dialog open={!!editNewsSource} onClose={() => setEditNewsSource(null)}>
            <DialogTitle>Edit {editNewsSource?.name} Settings</DialogTitle>
            <DialogContent>
              <NewsSourceSettingsEditor
                source={editNewsSource}
                onClose={() => setEditNewsSource(null)}
              />
            </DialogContent>
          </Dialog>
        </Paper>
      )}

      {/* Auth Providers Tab */}
      {tab === 1 && isGlobalAdmin && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Auth Providers
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {authProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                logo={provider.logo}
                id={provider.id}
                title={provider.title}
                enabled={providerEnabled[provider.id]}
                onToggle={handleToggle}
                onEdit={() => handleProviderEditOpen(provider.id)}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* User Management Tab */}
      {tab === 2 && isGlobalAdmin && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {users.map((user: any) => (
              <ProviderCard
                key={user.id}
                logo={user.avatar || ''}
                title={user.name}
                id={user.id}
                enabled={user.enabled ?? true}
                onEdit={() => handleUserEditOpen(user)}
                showToggle={false}
              >
                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
              </ProviderCard>
            ))}
          </Box>
        </Paper>
      )}

      {/* Social Media Tab */}
      {((isGlobalAdmin && tab === 3) || (!isGlobalAdmin && tab === 0)) && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Social Media
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {socialMedias.map((media) => (
              <ProviderCard
                key={media.id}
                logo={media.logo}
                title={media.title}
                id={media.id}
                enabled={media.enabled}
                onToggle={handleToggle}
                onEdit={media.onEdit}
              />
            ))}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

// Editor component for news source settings
function NewsSourceSettingsEditor({ source, onClose }: { source: any, onClose: () => void }) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (source) {
      source.getSettings().then(setSettings).finally(() => setLoading(false));
    }
  }, [source]);

  const handleSave = async () => {
    setLoading(true);
    await source.saveSettings(settings);
    setLoading(false);
    onClose();
  };

  if (!source) return null;
  if (loading) return <Box sx={{ p: 2 }}>Loading...</Box>;

  return (
    <Box sx={{ minWidth: 300 }}>
      {Object.keys(settings || {}).map(key => (
        <TextField
          key={key}
          label={key}
          value={settings[key]}
          onChange={e => setSettings({ ...settings, [key]: e.target.value })}
          margin="normal"
          fullWidth
        />
      ))}
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </Box>
    </Box>
  );
}