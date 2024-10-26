import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const RandomNumbers: React.FC = () => {
  const [randomNumbers, setRandomNumbers] = useState({ random_int1: 0, random_int2: 0, random_int3: 0 });

  useEffect(() => {
    socket.on('random_data', (data) => {
      setRandomNumbers(data);
    });

    return () => {
      socket.off('random_data');
    };
  }, []);

  return (
    <div>
      <h1>Random Numbers</h1>
      <ul className="list-group">
        <li className="list-group-item">Random Number 1: {randomNumbers.random_int1}</li>
        <li className="list-group-item">Random Number 2: {randomNumbers.random_int2}</li>
        <li className="list-group-item">Random Number 3: {randomNumbers.random_int3}</li>
      </ul>
    </div>
  );
};

export default RandomNumbers;
