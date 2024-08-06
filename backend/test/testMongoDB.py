import pymongo
from pymongo.errors import ConnectionFailure

# Replace these with your actual connection details
COSMOS_DB_URI = "mongodb+srv://yoventure:Scienceasavocation233^^@yvmongoeast.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000"
COSMOS_DB_NAME = "yvuser"
COSMOS_DB_COLLECTION = "profile"

def test_cosmos_db_connection():
    try:
        # Create a MongoDB client
        client = pymongo.MongoClient(COSMOS_DB_URI)

        # Test the connection
        client.admin.command('ping')
        print("Connected to MongoDB")

        # Get the database and collection
        db = client[COSMOS_DB_NAME]
        collection = db[COSMOS_DB_COLLECTION]

        # Create a sample document
        sample_document = {
          "name": "mm",
          "user_id": "mm@example.com",
          "phone": "123666789",
          "password": "67pass123",
          "gender": "female",
          "date_of_birth": "1990-01-01"
        }


        # Insert the sample document
        result = collection.insert_one(sample_document)
        print(f"Inserted document with _id: {result.inserted_id}")

        # Read the inserted document
        inserted_document = collection.find_one({"_id": result.inserted_id})
        print("Inserted Document:", inserted_document)

        return client

    except ConnectionFailure as e:
        print("Could not connect to MongoDB:", e)
        return None

if __name__ == "__main__":
    client = test_cosmos_db_connection()
    if client:
        # Close the connection when done
        client.close()