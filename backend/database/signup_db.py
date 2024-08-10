from flask import Flask, request, jsonify
import pymongo
from pymongo.errors import ConnectionFailure
import bcrypt
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

COSMOS_DB_URI = "mongodb+srv://yoventure:Scienceasavocation233^^@yvmongoeast.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"
COSMOS_DB_NAME = "yvuser"
COSMOS_DB_COLLECTION = "profile"

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

    db = client[COSMOS_DB_NAME]
    collection = db[COSMOS_DB_COLLECTION]

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

    db = client[COSMOS_DB_NAME]
    collection = db[COSMOS_DB_COLLECTION]
    
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

    db = client[COSMOS_DB_NAME]
    collection = db[COSMOS_DB_COLLECTION]
    
    user = collection.find_one({"user_id": data['email']})

    if user:
        user['_id'] = str(user['_id'])  # Convert ObjectId to string
        client.close()
        return jsonify({"success": True, "user": user})
    else:
        client.close()
        return jsonify({"success": False, "message": "User not found"})

# if __name__ == "__main__":
#     app.run(port=5002)
