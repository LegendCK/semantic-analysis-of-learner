import { Box, Container, List, ListItem, ListItemText, Typography } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom sx={{ color: 'primary.main' }}>
        ConceptBridge Learning System
      </Typography>
      
      <Typography variant="h5" gutterBottom>
        Objective
      </Typography>
      <Typography paragraph>
        Our system uses NLP to analyze student queries, identify concept gaps using 
        a curriculum knowledge graph, and recommend personalized learning resources.
      </Typography>

      <Typography variant="h5" gutterBottom>
        Key Features
      </Typography>
      <List>
        {[
          'Natural language query processing',
          'Curriculum-aligned knowledge graph',
          'Personalized video recommendations',
          'Concept gap analysis',
          'Interactive learning dashboard'
        ].map((feature, i) => (
          <ListItem key={i}>
            <ListItemText primary={feature} />
          </ListItem>
        ))}
      </List>

      <Typography variant="h5" gutterBottom>
        Technology Stack
      </Typography>
      <Box component="ul" sx={{ pl: 4 }}>
        <li><Typography>Frontend: React.js</Typography></li>
        <li><Typography>Backend: Node.js + Express</Typography></li>
        <li><Typography>Database: MongoDB</Typography></li>
        <li><Typography>NLP Engine: Python + BERT</Typography></li>
      </Box>
    </Container>
  );
};

export default AboutPage;
