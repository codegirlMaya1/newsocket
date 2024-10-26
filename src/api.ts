import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.tomtom.com',
  params: {
    key: 'OXkWSbc6W3a1v4Qp4t6Ehxbka8Eqv6tG',
  },
});

export default api;
