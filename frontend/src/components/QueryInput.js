import { useState } from 'react';

const QueryInput = ({ onSubmit, loading, onReset }) => {
  const [query, setQuery] = useState('');
  const [queryHistory, setQueryHistory] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSubmit(query);
      setQueryHistory(prev => [query, ...prev.slice(0, 4)]);
      setQuery('');
    }
  };

  const handleHistoryClick = (historicalQuery) => {
    setQuery(historicalQuery);
  };

  return (
    <div className="query-input-container">
      <form onSubmit={handleSubmit} className="query-form">
        <div className="input-group">
          <label htmlFor="query">Ask your question:</label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., I don't understand how binary search works in recursion..."
            rows="4"
            cols="50"
            disabled={loading}
            className="query-textarea"
          />
        </div>
        
        <div className="button-group">
          <button 
            type="submit" 
            disabled={loading || !query.trim()}
            className="submit-btn"
          >
            {loading ? 'Analyzing...' : 'Get Recommendation'}
          </button>
          
          <button 
            type="button" 
            onClick={() => {
              setQuery('');
              onReset();
            }}
            className="reset-btn"
          >
            Clear
          </button>
        </div>
      </form>
      
      {queryHistory.length > 0 && (
        <div className="query-history">
          <h4>Recent Queries:</h4>
          <ul>
            {queryHistory.map((item, index) => (
              <li key={index}>
                <button
                  onClick={() => handleHistoryClick(item)}
                  className="history-item"
                >
                  {item.length > 50 ? `${item.substring(0, 50)}...` : item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default QueryInput;
