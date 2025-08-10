from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel, EmailStr
from typing import List, Optional
import os
import uuid
import random
from datetime import datetime
import smtplib
from email.mime.text import MimeText
from email.mime.multipart import MimeMultipart

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/proyectos_flores')

app = FastAPI(title="Proyectos Flores Clone", description="Sistema de rifas de vehículos")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
try:
    client = MongoClient(MONGO_URL)
    db = client.proyectos_flores
    print("✅ Connected to MongoDB successfully")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

# Pydantic models
class Activity(BaseModel):
    id: Optional[str] = None
    number: int
    title: str
    description: str
    images: List[str]
    prize: str
    total_numbers: int = 100000
    sold_numbers: int = 0
    price_per_number: float = 1.0
    is_active: bool = True
    instant_prizes: List[dict] = []
    created_at: Optional[datetime] = None

class NumberPackage(BaseModel):
    quantity: int
    price: float

class PurchaseRequest(BaseModel):
    activity_id: str
    quantity: int
    email: EmailStr
    name: str
    phone: str

class NumberQuery(BaseModel):
    email: EmailStr

class UserNumbers(BaseModel):
    id: Optional[str] = None
    email: str
    name: str
    phone: str
    activity_id: str
    numbers: List[str]
    purchase_date: datetime
    total_paid: float

# Sample data initialization
def init_sample_data():
    # Check if activities collection is empty
    if db.activities.count_documents({}) == 0:
        sample_activity = {
            "_id": "activity_34",
            "number": 34,
            "title": "CHEVROLET DMAX 4X4 DIÉSEL + KTM DUKE 390 0km",
            "description": "¡Participa en nuestra rifa más emocionante! Gana una Chevrolet D-MAX 4x4 Diésel + KTM Duke 390 nueva.",
            "images": [
                "https://proyectosflores.com/wp-content/uploads/2025/08/actividad_34_dmax_duke_390.jpeg",
                "https://proyectosflores.com/wp-content/uploads/2025/08/actividad_34_dmax_duke_390_6.jpeg",
                "https://proyectosflores.com/wp-content/uploads/2025/08/ACTIVIDAD-34.jpg",
                "https://proyectosflores.com/wp-content/uploads/2025/08/actividad_34_dmax_duke_390_19.jpeg",
                "https://proyectosflores.com/wp-content/uploads/2025/08/actividad_34_dmax_duke_390_15.jpeg"
            ],
            "prize": "Chevrolet D-MAX 4x4 Diésel + KTM Duke 390",
            "total_numbers": 100000,
            "sold_numbers": 30530,
            "price_per_number": 1.0,
            "is_active": True,
            "instant_prizes": [
                {"number": "01010", "amount": 100, "claimed": True},
                {"number": "12221", "amount": 50, "claimed": False},
                {"number": "23456", "amount": 75, "claimed": False},
                {"number": "35678", "amount": 50, "claimed": False},
                {"number": "47890", "amount": 100, "claimed": False},
                {"number": "58123", "amount": 50, "claimed": False},
                {"number": "69345", "amount": 75, "claimed": True},
                {"number": "74474", "amount": 50, "claimed": False},
                {"number": "80001", "amount": 100, "claimed": False},
                {"number": "00963", "amount": 50, "claimed": False}
            ],
            "created_at": datetime.now()
        }
        db.activities.insert_one(sample_activity)
        
        # Sample past activities
        past_activities = [
            {
                "_id": "activity_24",
                "number": 24,
                "title": "Suzuki Swift",
                "description": "Suzuki Swift entregado",
                "prize": "Suzuki Swift",
                "is_active": False,
                "winner": "Juan Pérez",
                "created_at": datetime(2024, 12, 15)
            },
            {
                "_id": "activity_22", 
                "number": 22,
                "title": "Chevrolet ONIX Turbo RS",
                "description": "Chevrolet ONIX Turbo RS entregado",
                "prize": "Chevrolet ONIX Turbo RS", 
                "is_active": False,
                "winner": "María González",
                "created_at": datetime(2024, 11, 20)
            },
            {
                "_id": "activity_19",
                "number": 19, 
                "title": "Yamaha MT-03",
                "description": "Yamaha MT-03 entregada",
                "prize": "Yamaha MT-03",
                "is_active": False,
                "winner": "Carlos López",
                "created_at": datetime(2024, 10, 10)
            }
        ]
        db.activities.insert_many(past_activities)

# Initialize sample data
init_sample_data()

# API Routes
@app.get("/")
def read_root():
    return {"message": "Proyectos Flores API - Sistema de Rifas"}

@app.get("/api/activities")
def get_activities():
    """Get all activities"""
    activities = list(db.activities.find())
    for activity in activities:
        activity["_id"] = str(activity["_id"])
    return activities

@app.get("/api/activities/active")
def get_active_activity():
    """Get current active activity"""
    activity = db.activities.find_one({"is_active": True})
    if activity:
        activity["_id"] = str(activity["_id"])
        # Calculate progress percentage
        progress = (activity["sold_numbers"] / activity["total_numbers"]) * 100
        activity["progress"] = round(progress, 2)
        return activity
    return {"message": "No active activity found"}

@app.get("/api/activities/{activity_id}")
def get_activity(activity_id: str):
    """Get specific activity"""
    activity = db.activities.find_one({"_id": activity_id})
    if activity:
        activity["_id"] = str(activity["_id"])
        return activity
    raise HTTPException(status_code=404, detail="Activity not found")

@app.get("/api/packages")
def get_packages():
    """Get available number packages"""
    return [
        {"quantity": 10, "price": 10, "popular": False},
        {"quantity": 15, "price": 15, "popular": False},
        {"quantity": 20, "price": 20, "popular": True},
        {"quantity": 30, "price": 30, "popular": False},
        {"quantity": 50, "price": 50, "popular": False},
        {"quantity": 100, "price": 100, "popular": False}
    ]

@app.post("/api/purchase")
def purchase_numbers(purchase: PurchaseRequest):
    """Purchase numbers for a raffle"""
    try:
        # Find activity
        activity = db.activities.find_one({"_id": purchase.activity_id})
        if not activity:
            raise HTTPException(status_code=404, detail="Activity not found")
        
        if not activity["is_active"]:
            raise HTTPException(status_code=400, detail="Activity is not active")
        
        # Generate random numbers
        numbers = []
        for _ in range(purchase.quantity):
            number = str(random.randint(0, 99999)).zfill(5)
            numbers.append(number)
        
        # Create user numbers record
        user_numbers = {
            "_id": str(uuid.uuid4()),
            "email": purchase.email,
            "name": purchase.name,
            "phone": purchase.phone,
            "activity_id": purchase.activity_id,
            "numbers": numbers,
            "purchase_date": datetime.now(),
            "total_paid": purchase.quantity * activity["price_per_number"]
        }
        
        # Save to database
        db.user_numbers.insert_one(user_numbers)
        
        # Update sold numbers count
        db.activities.update_one(
            {"_id": purchase.activity_id},
            {"$inc": {"sold_numbers": purchase.quantity}}
        )
        
        # Check for instant prizes
        instant_wins = []
        for number in numbers:
            for prize in activity["instant_prizes"]:
                if number == prize["number"] and not prize["claimed"]:
                    instant_wins.append({"number": number, "amount": prize["amount"]})
                    # Mark as claimed
                    db.activities.update_one(
                        {"_id": purchase.activity_id, "instant_prizes.number": number},
                        {"$set": {"instant_prizes.$.claimed": True}}
                    )
        
        return {
            "success": True,
            "message": "Purchase completed successfully",
            "numbers": numbers,
            "instant_wins": instant_wins,
            "total_paid": user_numbers["total_paid"]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/query-numbers")
def query_numbers(query: NumberQuery):
    """Query user numbers by email"""
    try:
        user_numbers = list(db.user_numbers.find({"email": query.email}))
        
        result = []
        for record in user_numbers:
            activity = db.activities.find_one({"_id": record["activity_id"]})
            result.append({
                "activity_title": activity["title"] if activity else "Unknown",
                "activity_number": activity["number"] if activity else 0,
                "numbers": record["numbers"],
                "purchase_date": record["purchase_date"],
                "total_paid": record["total_paid"]
            })
        
        return {"success": True, "data": result}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/past-activities")
def get_past_activities():
    """Get past completed activities"""
    activities = list(db.activities.find({"is_active": False}).sort("created_at", -1))
    for activity in activities:
        activity["_id"] = str(activity["_id"])
    return activities

@app.get("/api/instant-prizes/{activity_id}")
def get_instant_prizes(activity_id: str):
    """Get instant prizes for an activity"""
    activity = db.activities.find_one({"_id": activity_id})
    if activity and "instant_prizes" in activity:
        return activity["instant_prizes"]
    return []

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)