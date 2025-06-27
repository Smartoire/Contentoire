import { useState } from 'react';
import { Box, Button, TextField, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [jobType, setJobType] = useState('summarize');
  const [inputText, setInputText] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          type: jobType
        }),
      });
      const data = await response.json();
      setResult(data.result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const statsData = {
    labels: ['Total', 'Completed', 'Pending'],
    datasets: [
      {
        data: [stats.totalJobs, stats.completedJobs, stats.pendingJobs],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Content Processing Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Process Content
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Input Text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                margin="normal"
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setJobType('summarize')}
                  sx={{ mr: 1 }}
                >
                  Summarize
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setJobType('ner')}
                  sx={{ mr: 1 }}
                >
                  Extract Entities
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setJobType('image')}
                >
                  Generate Image
                </Button>
              </Box>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={processing || !inputText}
                sx={{ mt: 2 }}
              >
                {processing ? <CircularProgress size={24} /> : 'Process'}
              </Button>
            </form>
            {result && (
              <Typography variant="body1" sx={{ mt: 2 }}>
                Result: {JSON.stringify(result)}
              </Typography>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Job Statistics
            </Typography>
            <Doughnut data={statsData} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
