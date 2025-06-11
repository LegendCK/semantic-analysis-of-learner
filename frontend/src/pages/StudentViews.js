// src/pages/StudentView.js
import {
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Grid,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import ReactPlayer from 'react-player';
import { useNavigate } from 'react-router-dom';

const StudentView = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentQueries, setRecentQueries] = useState([]);
  const [tabValue, setTabValue] = useState('all');
  const navigate = useNavigate();

  // Sample microlearning suggestions (replace with real data)
  const [suggestions] = useState([
    { 
      title: "Introduction to Algorithms", 
      url: "https://youtu.be/rL8X2mlNHPM",
      difficulty: 'Beginner',
      concepts: ['Algorithms', 'Complexity']
    },
    {
      title: "Advanced Data Structures",
      url: "https://youtu.be/B31LgI4Y4DQ",
      difficulty: 'Advanced',
      concepts: ['Trees', 'Graphs']
    }
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/analyze', { query });
      setResults(response.data);
      setRecentQueries(prev => [query, ...prev.slice(0, 4)]);
      setQuery('');
    } catch (err) {
      setError('Failed to process query. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => 
    tabValue === 'all' ? true : suggestion.difficulty === tabValue
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Query Input Section */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
          Ask Your DSA Question
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Explain time complexity of merge sort..."
            sx={{ mb: 2 }}
          />
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={loading || !query.trim()}
              sx={{ px: 4 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Analyze'}
            </Button>
            
            {recentQueries.length > 0 && (
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Recent queries: 
                </Typography>
                {recentQueries.map((q, i) => (
                  <Chip
                    key={i}
                    label={q}
                    onClick={() => setQuery(q)}
                    size="small"
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </form>

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </Paper>

      {/* Results Section */}
      {results && (
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          {results.video ? (
            <>
              <Typography variant="h5" gutterBottom>
                Recommended Video: {results.video.title}
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <ReactPlayer 
                  url={results.video.url} 
                  controls 
                  width="100%"
                  height="400px"
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1">
                  Mapped Concepts:
                </Typography>
                {results.concepts.map((concept, i) => (
                  <Chip
                    key={i}
                    label={`${concept.name} (${Math.round(concept.confidence * 100)}%)`}
                    sx={{ mr: 1, mb: 1 }}
                    color="primary"
                  />
                ))}
              </Box>
            </>
          ) : (
            <Typography variant="h6" color="textSecondary">
              Sorry, we couldn't find a video for your query
            </Typography>
          )}
        </Paper>
      )}

      {/* Microlearning Suggestions */}
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Recommended Learning Paths
        </Typography>
        
        <Tabs 
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ mb: 2 }}
        >
          <Tab label="All" value="all" />
          <Tab label="Beginner" value="Beginner" />
          <Tab label="Intermediate" value="Intermediate" />
          <Tab label="Advanced" value="Advanced" />
        </Tabs>

        <Grid container spacing={3}>
          {filteredSuggestions.map((suggestion, i) => (
            <Grid item xs={12} md={6} key={i}>
              <Paper sx={{ p: 2, height: '100%' }}>
                <ReactPlayer
                  url={suggestion.url}
                  width="100%"
                  height="200px"
                  controls
                />
                <Typography variant="subtitle1" sx={{ mt: 1 }}>
                  {suggestion.title}
                </Typography>
                <Chip 
                  label={suggestion.difficulty} 
                  size="small" 
                  sx={{ mt: 1 }}
                  color={
                    suggestion.difficulty === 'Advanced' ? 'error' : 
                    suggestion.difficulty === 'Intermediate' ? 'warning' : 'success'
                  }
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Container>
  );
};

export default StudentView;
