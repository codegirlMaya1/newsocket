import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts',
  'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
  'Wisconsin', 'Wyoming'
];

const Traffic: React.FC = () => {
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [placesData, setPlacesData] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [cities, setCities] = useState<any[]>([]);
  const [latestIncident, setLatestIncident] = useState<string | null>(null);

  useEffect(() => {
    socket.on('location_suggestions', (data) => {
      setCities(data);
    });

    socket.on('traffic_data', (data) => {
      if (data.message) {
        setTrafficData([]);
        setLatestIncident(data.message);
      } else {
        setTrafficData(data.incidents);
        setPlacesData(data.places);
        setLatestIncident(null);
      }
    });

    return () => {
      socket.off('location_suggestions');
      socket.off('traffic_data');
    };
  }, []);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity('');
    setCities([]);
    if (state) {
      socket.emit('search_location', { query: state });
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(e.target.value);
  };

  const handleSearch = () => {
    if (selectedCity) {
      const city = cities.find(city => city.address.freeformAddress === selectedCity);
      if (city) {
        socket.emit('fetch_traffic', { lat: city.position.lat, lon: city.position.lon });
      }
    }
  };

  return (
    <div>
      <h1>Traffic</h1>
      <select value={selectedState} onChange={handleStateChange} className="form-control mb-2">
        <option value="">Select State</option>
        {states.map((state, index) => (
          <option key={index} value={state}>{state}</option>
        ))}
      </select>
      {cities.length > 0 && (
        <select value={selectedCity} onChange={handleCityChange} className="form-control mb-2">
          <option value="">Select City</option>
          {cities.map((city, index) => (
            <option key={index} value={city.address.freeformAddress}>{city.address.freeformAddress}</option>
          ))}
        </select>
      )}
      <button onClick={handleSearch} className="btn btn-info mb-3">Search Traffic Incidents</button>
      <h2>Traffic Incidents</h2>
      <ul className="list-group">
        {trafficData.length > 0 ? (
          trafficData.map((incident, index) => (
            <li key={index} className="list-group-item">
              <p>{incident.description}</p>
              <p>Location: {incident.location.latitude}, {incident.location.longitude}</p>
              <p>Start Time: {incident.startTime}</p>
            </li>
          ))
        ) : (
          <li className="list-group-item">No recent traffic incidents</li>
        )}
      </ul>
      {latestIncident && (
        <div>
          <h2>{latestIncident}</h2>
        </div>
      )}
      <h2>Places in the Area</h2>
      <ul className="list-group">
        {placesData.length > 0 ? (
          placesData.map((place, index) => (
            <li key={index} className="list-group-item">
              <p>{place.name}</p>
              <p>Category: {place.category}</p>
              <p>Location: {place.position.lat}, {place.position.lon}</p>
            </li>
          ))
        ) : (
          <li className="list-group-item">No places found in the area</li>
        )}
      </ul>
    </div>
  );
};

export default Traffic;
