import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface LocationData {
  address: {
    freeformAddress: string;
  };
  position: {
    lat: number;
    lon: number;
  };
}

interface Route {
  summary: {
    boundingBox: {
      topLeft: {
        lat: number;
        lng: number;
      };
      bottomRight: {
        lat: number;
        lng: number;
      };
    };
    lengthInMeters: number;
    travelTimeInSeconds: number;
  };
}

const Location: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationData[]>([]);
  const [startLocation, setStartLocation] = useState<string>('');
  const [endLocation, setEndLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [routes, setRoutes] = useState<Route[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<{ start: boolean; end: boolean }>({ start: false, end: false });
  const [mapUrl, setMapUrl] = useState<string>('');

  useEffect(() => {
    if (searchQuery.start.length > 2) {
      fetchLocationData(searchQuery.start);
    }
  }, [searchQuery.start]);

  useEffect(() => {
    if (searchQuery.end.length > 2) {
      fetchLocationData(searchQuery.end);
    }
  }, [searchQuery.end]);

  const fetchLocationData = (query: string) => {
    axios.get(`https://api.tomtom.com/search/2/search/${query}.json?key=OXkWSbc6W3a1v4Qp4t6Ehxbka8Eqv6tG`)
      .then(response => {
        setLocationData(response.data.results);
        setShowSuggestions({ start: query === searchQuery.start, end: query === searchQuery.end });
      })
      .catch(error => {
        console.error('Error fetching location data:', error);
      });
  };

  const handleSearch = () => {
    const url = `https://api.tomtom.com/routing/1/calculateRoute/${startLocation}:${endLocation}/json?key=OXkWSbc6W3a1v4Qp4t6Ehxbka8Eqv6tG`;
    axios.get(url)
      .then(response => {
        setRoutes(response.data.routes);
        generateMapUrl(response.data.routes);
      })
      .catch(error => {
        console.error('Error fetching directions:', error);
      });
  };

  const generateMapUrl = (routes: Route[]) => {
    if (routes.length > 0) {
      const route = routes[0]; // Take the first route for simplicity
      const boundingBox = route.summary.boundingBox;
      const mapUrl = `https://api.tomtom.com/map/1/staticimage?layer=basic&style=main&format=png&bbox=${boundingBox.topLeft.lng},${boundingBox.topLeft.lat},${boundingBox.bottomRight.lng},${boundingBox.bottomRight.lat}&zoom=10&key=OXkWSbc6W3a1v4Qp4t6Ehxbka8Eqv6tG`;
      setMapUrl(mapUrl);
    }
  };

  return (
    <div>
      <h1>Location</h1>
      <input
        type="text"
        value={searchQuery.start}
        onChange={(e) => setSearchQuery(prev => ({ ...prev, start: e.target.value }))}
        placeholder="Start Location"
        className="form-control mb-2"
      />
      {showSuggestions.start && (
        <ul className="list-group">
          {locationData.map((location, index) => (
            <li
              key={index}
              className="list-group-item"
              onClick={() => {
                setSearchQuery(prev => ({ ...prev, start: location.address.freeformAddress }));
                setStartLocation(location.position.lat + ',' + location.position.lon);
                setShowSuggestions(prev => ({ ...prev, start: false }));
              }}
            >
              {location.address.freeformAddress}
            </li>
          ))}
        </ul>
      )}
      <input
        type="text"
        value={searchQuery.end}
        onChange={(e) => setSearchQuery(prev => ({ ...prev, end: e.target.value }))}
        placeholder="End Location"
        className="form-control mb-2"
      />
      {showSuggestions.end && (
        <ul className="list-group">
          {locationData.map((location, index) => (
            <li
              key={index}
              className="list-group-item"
              onClick={() => {
                setSearchQuery(prev => ({ ...prev, end: location.address.freeformAddress }));
                setEndLocation(location.position.lat + ',' + location.position.lon);
                setShowSuggestions(prev => ({ ...prev, end: false }));
              }}
            >
              {location.address.freeformAddress}
            </li>
          ))}
        </ul>
      )}
      <button onClick={handleSearch} className="btn btn-info mb-3">Search Routes</button>
      <h2>Routes</h2>
      <ul className="list-group">
        {routes.map((route, index) => (
          <li key={index} className="list-group-item">
            <h5>Route {index + 1}</h5>
            <p>Distance: {route.summary.lengthInMeters / 1000} km</p>
            <p>Time: {route.summary.travelTimeInSeconds / 60} minutes</p>
          </li>
        ))}
      </ul>
      {mapUrl && (
        <div className="mt-3">
          <h2>Map</h2>
          <img src={mapUrl} alt="Map" className="img-fluid" />
        </div>
      )}
    </div>
  );
};

export default Location;
