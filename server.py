import os
import requests
from flask import Flask, jsonify
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

TOMTOM_API_KEY = 'OXkWSbc6W3a1v4Qp4t6Ehxbka8Eqv6tG'
BASE_URL = 'https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json'

@app.route('/start')
def start():
    return jsonify({"message": "Python server started!"})

@socketio.on('get_traffic_data')
def handle_get_traffic_data(location):
    params = {
        'point': location,
        'key': TOMTOM_API_KEY,
    }
    response = requests.get(BASE_URL, params=params)
    traffic_data = response.json()
    socketio.emit('traffic_data', traffic_data)

if __name__ == '__main__':
    socketio.run(app)
