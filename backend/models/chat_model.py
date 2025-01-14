from bson import ObjectId
from config import init_db
from datetime import datetime

db = init_db()

def create_chat(participants):
    chat = {
        "participants": participants,
        "last_message": "",
        "last_message_time": datetime.utcnow()
    }
    return db.chats.insert_one(chat)

def get_chats(user_id):
    chats = list(db.chats.find({"participants": ObjectId(user_id)}).sort("last_message_time", -1))
    return chats

def update_chat(chat_id, last_message, last_message_time):
    return db.chats.update_one(
        {"_id": ObjectId(chat_id)},
        {"$set": {
            "last_message": last_message,
            "last_message_time": last_message_time
        }}
    )