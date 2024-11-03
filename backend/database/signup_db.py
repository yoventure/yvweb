from flask import Flask, request, jsonify
import pymongo
from pymongo.errors import ConnectionFailure
import bcrypt
from dotenv import load_dotenv
from bson import ObjectId  # Import ObjectId from bson
import requests
import googlemaps
import os


load_dotenv()

app = Flask(__name__)
# 使用环境变量获取 Google Maps API Key
gmaps = googlemaps.Client(key=os.getenv('GOOGLE_MAPS_API_KEY'))

# 使用环境变量获取 MongoDB URI 和数据库信息
COSMOS_DB_URI = os.getenv('COSMOS_DB_URI')
COSMOS_DB_NAME_1 = os.getenv('COSMOS_DB_NAME_1')
COSMOS_DB_COLLECTION_1 = os.getenv('COSMOS_DB_COLLECTION_1')
COSMOS_DB_NAME_2 = os.getenv('COSMOS_DB_NAME_2')
COSMOS_DB_COLLECTION_2 = os.getenv('COSMOS_DB_COLLECTION_2')

def get_db_client():
    try:
        client = pymongo.MongoClient(COSMOS_DB_URI)
        client.admin.command('ping')
        print("Connected to MongoDB")
        return client
    except ConnectionFailure as e:
        print("Could not connect to MongoDB:", e)
        return None

def update_passwords():
    client = get_db_client()
    if not client:
        return

    db = client[COSMOS_DB_NAME_1]
    collection = db[COSMOS_DB_COLLECTION_1]

    users = collection.find({"password": {"$not": {"$regex": "^\$2[ayb]\$"}}})  # 查找未散列密码的用户
    for user in users:
        hashed_password = bcrypt.hashpw(user['password'].encode('utf-8'), bcrypt.gensalt())
        collection.update_one({"_id": user['_id']}, {"$set": {"password": hashed_password.decode('utf-8')}})
        print(f"Updated password for user {user['userid']}")

    client.close()

@app.route('/insert', methods=['POST'])
def insert_document():
    data = request.json
    client = get_db_client()
    if not client:
        return jsonify({"success": False, "error": "Could not connect to MongoDB"}), 500

    db = client[COSMOS_DB_NAME_1]
    collection = db[COSMOS_DB_COLLECTION_1]
    
    result = collection.insert_one(data)
    inserted_document = collection.find_one({"_id": result.inserted_id})

    # Convert ObjectId to string
    inserted_document['_id'] = str(inserted_document['_id'])

    client.close()
    return jsonify({"success": True, "document": inserted_document})

@app.route('/find_user', methods=['POST'])
def find_user():
    data = request.json
    print(data)
    client = get_db_client()
    if not client:
        return jsonify({"success": False, "error": "Could not connect to MongoDB"}), 500

    db = client[COSMOS_DB_NAME_1]
    collection = db[COSMOS_DB_COLLECTION_1]
    
    user = collection.find_one({"user_id": data['email']})

    if user:
        user['_id'] = str(user['_id'])  # Convert ObjectId to string
        client.close()
        return jsonify({"success": True, "user": user})
    else:
        client.close()
        return jsonify({"success": False, "message": "User not found"})
    
def serialize_impression_cards(cards):
    serialized_cards = []
    for card in cards:
        serialized_card = {
            '_id': str(card['_id']),  # Convert ObjectId to string
            'from_crawl': str(card['from_crawl']),  # Convert ObjectId to string
            'source_urls': card['source_urls'],
            'city': card['city'],
            'PoI': card['PoI'],
            'pic_urls': card['pic_urls'],
            'pic_urls_season': card['pic_urls_season'],
            'duration': card['duration'],
            'cost': card['cost'],
            'op_time': card['op_time'],
            'attraction_reviews': card['attraction_reviews'],
            'attraction_reviews_season': card['attraction_reviews_season'],
            'act': card['act']
        }
        serialized_cards.append(serialized_card)
    return serialized_cards

@app.route('/get_impression_cards', methods=['POST'])
def get_impression_cards():
    data = request.json
    ids = data.get('ids', [])
    print(ids)
    if not ids or not isinstance(ids, list):
        return jsonify({"success": False, "message": "Invalid ID list"}), 400

    client = get_db_client()
    if not client:
        return jsonify({"success": False, "error": "Could not connect to MongoDB"}), 500

    db = client[COSMOS_DB_NAME_2]
    collection = db[COSMOS_DB_COLLECTION_2]  # 假设印象卡存储在 'impression_cards' 集合中

    # Convert string IDs to ObjectId
    object_ids = [ObjectId(id) for id in ids]
    cards = collection.find({"_id": {"$in": object_ids}})

    serialized_cards = serialize_impression_cards(cards)

    client.close()
    return jsonify(serialized_cards)

def get_poi_coordinates(address, api_key):
    # 构建API请求URL
    endpoint = "https://maps.googleapis.com/maps/api/geocode/json"
    params = {
        'address': address,
        'key': api_key
    }

    # Send a GET request to the endpoint
    response = requests.get(endpoint, params=params)
    
    # Check if the request was successful
    if response.status_code == 200:
        data = response.json()
        # Check if results were found
        if data['status'] == 'OK':
            # Extract latitude and longitude from the response
            location = data['results'][0]['geometry']['location']
            return location['lat'], location['lng']
        else:
            raise ValueError(f"Error: {data['status']}")
    else:
        response.raise_for_status()

@app.route('/get_googlemap_POIs', methods=['POST'])
def get_googlemap_POIs():
    data = request.json
    print(data)
    api_key = 'AIzaSyAAMUOtHqut_xj28ddMZ-ItuxfCNTgVj6g'  # 替换为你的实际API密钥
    # 遍历传入的每个城市和 POI 列表
    results = []
    for city_info in data['pois']['data']:
        city_name = city_info.get('city', '')
        pois_in_city = {}
        
        for i, poi in enumerate(city_info):
            latitude, longitude = get_poi_coordinates(poi, api_key)
            
            pois_in_city[poi] = {
                'lat': latitude,
                'lng': longitude
            }

        # 构建返回结构
        results.append({
            'city': city_name,
            'pois': [pois_in_city]
        })

        print(results)

    return jsonify({'data': results})


@app.route('/get_googlemap_routes', methods=['POST'])
def get_googlemap_routes():
    data = request.json
    pois = data.get('pois')
    travel_mode = data.get('travelMode', 'driving').lower()
    print(travel_mode)

    # Extract POI coordinates from the data
    poi_list = []
    for poi_dict in pois:
        for poi_name, poi_coords in poi_dict.items():
            poi_list.append((poi_coords['lat'], poi_coords['lng']))

    print(poi_list)

    if len(poi_list) < 2:
        return jsonify({'error': 'Not enough POIs provided'}), 400

    route = []
    # Generate route segments between each pair of POIs
    for i in range(len(poi_list) - 1):
        origin = f"{poi_list[i][0]},{poi_list[i][1]}"
        destination = f"{poi_list[i + 1][0]},{poi_list[i + 1][1]}"

        directions_result = gmaps.directions(
            origin=origin,
            destination=destination,
            mode=travel_mode
        )

        if directions_result:
            for step in directions_result[0]['legs'][0]['steps']:
                route.append({
                    'lat': step['end_location']['lat'],
                    'lng': step['end_location']['lng']
                })


    if directions_result:
        for step in directions_result[0]['legs'][0]['steps']:
            route.append({
                'lat': step['end_location']['lat'],
                'lng': step['end_location']['lng']
            })
    print(route)
    return jsonify({'route': route})

if __name__ == "__main__":
    app.run(port=5002)
