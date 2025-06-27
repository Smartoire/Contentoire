import { Paper, Avatar, Typography, IconButton, Switch } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { alpha } from '@mui/material/styles';

export default function ProviderCard(props: {
  logo: string;
  title: string;
  id: string;
  enabled: boolean;
  onToggle?: (id: string, enabled: boolean) => void;
  onEdit?: () => void;
  subtitle?: string;
  showToggle?: boolean;
  showEdit?: boolean;
  children?: React.ReactNode;
}) {
  const {
    logo,
    title,
    id,
    enabled,
    onToggle,
    onEdit,
    subtitle,
    showToggle = true,
    showEdit = true,
    children,
  } = props;

  return (
    <Paper
      sx={{
        p: 2,
        minWidth: 220,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1,
        position: 'relative',
        opacity: enabled ? 1 : 0.5,
        backgroundColor: enabled ? undefined : (theme) => alpha(theme.palette.background.paper, 0.7),
      }}
      elevation={3}
    >
      {showToggle && onToggle && (
        <Switch
          checked={enabled}
          onChange={(_, checked) => onToggle(id, checked)}
          color="primary"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 2,
            '& .MuiSwitch-thumb': { boxShadow: 'none' }
          }}
          inputProps={{ 'aria-label': `Enable ${title}` }}
        />
      )}
      <Avatar src={logo} alt={title} sx={{ width: 56, height: 56, mb: 1, mt: 2 }} />
      <Typography variant="subtitle1">{title}</Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
      )}
      {children}
      {showEdit && onEdit && (
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={onEdit}
        >
          <EditIcon />
        </IconButton>
      )}
    </Paper>
  );
}
