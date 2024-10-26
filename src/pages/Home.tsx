import React from 'react';
import axios from 'axios';

const Home: React.FC = () => {
  const startServer = () => {
    axios.get('http://localhost:5000/start')
      .then(response => {
        console.log('Server started:', response.data);
      })
      .catch(error => {
        console.error('Error starting server:', error);
      });
  };

  const stopServer = () => {
    axios.get('http://localhost:5000/stop')
      .then(response => {
        console.log('Server stopped:', response.data);
      })
      .catch(error => {
        console.error('Error stopping server:', error);
      });
  };

  return (
    <div>
      <h1>Home</h1>
      <button onClick={startServer} className="btn btn-primary">Start Server</button>
      <button onClick={stopServer} className="btn btn-danger">Stop Server</button>
    </div>
  );
};

export default Home;
