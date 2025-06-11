import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import Dashboard from './components/Dashboard'; // Dashboard page
import Header from './components/Header';
import AboutPage from './pages/AboutPage'; // About section
import StudentView from './pages/StudentView'; // Home page (query input)

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4fd1c7' },
    secondary: { main: '#63b3ed' },
    background: { default: '#0f1419', paper: '#1a202c' }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<StudentView />} />        {/* HOME: Query Input */}
          <Route path="/dashboard" element={<Dashboard />} /> {/* DASHBOARD */}
          <Route path="/about" element={<AboutPage />} />     {/* ABOUT */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
