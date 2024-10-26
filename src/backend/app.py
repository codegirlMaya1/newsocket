import random
import requests
from flask import Flask, jsonify, request
from flask_socketio import SocketIO, emit
import threading
import time

app = Flask(__name__)
socketio = SocketIO(app)

API_KEY = 'pk.e461260bdeac51f783898d40a141096a'

def generate_random_data():
    while True:
        data = {
            'random_int1': random.randint(1, 100),
            'random_int2': random.randint(1, 100),
            'random_int3': random.randint(1, 100)
        }
        socketio.emit('random_data', data)
        time.sleep(1)

def fetch_location_suggestions(query):
    url = f'https://api.tomtom.com/search/2/search/{query}.json?key={API_KEY}'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()['results']
    return []

def fetch_routes(start_location, end_location):
    url = f'https://api.tomtom.com/routing/1/calculateRoute/{start_location}:{end_location}/json?key={API_KEY}'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()['routes']
    return []

@app.route('/start', methods=['GET'])
def start():
    threading.Thread(target=generate_random_data).start()
    return jsonify({'status': 'Server started'})

@app.route('/stop', methods=['GET'])
def stop():
    socketio.stop()
    return jsonify({'status': 'Server stopped'})

@app.route('/location', methods=['GET'])
def get_location():
    start_location = request.args.get('start')
    end_location = request.args.get('end')
    routes = fetch_routes(start_location, end_location)
    return jsonify(routes)

@socketio.on('search_location')
def handle_search_location(data):
    query = data['query']
    suggestions = fetch_location_suggestions(query)
    emit('location_suggestions', suggestions)

@app.route('/search', methods=['GET'])
def search_bakeries():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    url = f'https://us1.locationiq.com/v1/nearest.php?key={API_KEY}&lat={lat}&lon={lon}&tag=bakery,cafe&limit=2'
    response = requests.get(url)
    if response.status_code == 200:
        return jsonify(response.json())
    return jsonify([])

@socketio.on('fetch_bakeries')
def fetch_bakeries(data):
    lat = data['lat']
    lon = data['lon']
    url = f'https://us1.locationiq.com/v1/nearest.php?key={API_KEY}&lat={lat}&lon={lon}&tag=bakery,cafe&limit=2'
    response = requests.get(url)
    if response.status_code == 200:
        emit('bakery_data', response.json())
    else:
        emit('bakery_data', [])

if __name__ == '__main__':
    def run_server():
        socketio.run(app, debug=True, use_reloader=False)

    server_thread = threading.Thread(target=run_server)
    server_thread.start()
