import React, { useState, useEffect } from 'react';
import axios from 'axios';

const SearchPage: React.FC = () => {
  const [, setLocation] = useState<{lat: number, lon: number} | null>(null);
  const [] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLocation({ lat, lon });

        const response = await axios.get(`https://us1.locationiq.com/v1/reverse.php?key=pk.e461260bdeac51f783898d40a141096a&lat=${lat}&lon=${lon}&format=json`);
        const data = response.data;
        document.getElementById('location')!.innerHTML = `Address: ${data.display_name}, Latitude: ${lat}, Longitude: ${lon}`;
        const mapUrl = `https://maps.locationiq.com/v2/staticmap?key=pk.e461260bdeac51f783898d40a141096a&center=${lat},${lon}&zoom=14&size=800x600&format=png&markers=icon:large-red-cutout|${lat},${lon}`;
        document.getElementById('mapholder')!.innerHTML = `<img src="${mapUrl}" alt="Map showing your location">`;
      });
    } else {
      document.getElementById('location')!.innerHTML = "Geolocation is not supported by this browser.";
    }
  }, []);

  const fetchAddressSuggestions = async () => {
    if (query.length > 2) {
      const response = await axios.get(`https://us1.locationiq.com/v1/autocomplete.php?key=pk.e461260bdeac51f783898d40a141096a&q=${query}`);
      const data = response.data;
      const suggestions = document.getElementById('suggestions')!;
      suggestions.innerHTML = '';
      data.forEach((item: any) => {
        const suggestion = document.createElement('div');
        suggestion.className = 'suggestion-item';
        suggestion.innerHTML = item.display_name;
        suggestion.onclick = () => showDirections(item.lat, item.lon, item.display_name);
        suggestions.appendChild(suggestion);
      });
    }
  };

  const showDirections = async (lat: number, lon: number, address: string) => {
    const userPosition = await getCurrentPosition();
    const latlon = `${userPosition.coords.latitude},${userPosition.coords.longitude}`;
    const directionsUrl = `https://maps.locationiq.com/v2/staticmap?key=pk.e461260bdeac51f783898d40a141096a&center=${lat},${lon}&zoom=14&size=800x600&format=png&markers=icon:large-red-cutout|${latlon}|${lat},${lon}`;
    document.getElementById('directions')!.innerHTML = `<h3>Directions to ${address}</h3><img src="${directionsUrl}" alt="Directions to ${address}">`;
  };

  const getCurrentPosition = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  };

  return (
    <div>
      <h1>This is where you are</h1>
      <p><h5> Click on a search option to get started.....</h5></p>
      <div id="location">Loading location...</div>
      <div id="mapholder">Loading map...</div>
      <footer>
        <h2>Search for an Address</h2>
        <input type="text" id="searchInput" placeholder="Enter an address" value={query} onChange={(e) => setQuery(e.target.value)} onInput={fetchAddressSuggestions} />
        <div id="suggestions"></div>
        <div id="directions"></div>
      </footer>
    </div>
  );
};

export default SearchPage;
