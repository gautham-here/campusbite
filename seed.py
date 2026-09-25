"""Loads campus outlets + sample menus for VIT Chennai (13 Permanent Outlets + 20 Event Stalls). Run: python seed.py"""
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", os.getenv("VITE_SUPABASE_URL", ""))
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY", os.getenv("VITE_SUPABASE_ANON_KEY", ""))

if not SUPABASE_URL or "YOUR-PROJECT" in SUPABASE_URL:
    print("Warning: Supabase credentials not found in .env file.")
    exit(1)

sb = create_client(SUPABASE_URL, SUPABASE_KEY)

G = "Gazebo (Main Canteen)"
N = "North Square"
A3 = "AB3 Amphitheatre"
A = "Academic Blocks"
S = "Campus Outlets & Stores"
E = "Riviera Event Stalls"

DATA = [
    # Location 1: Gazebo
    ("g1", G, "Gazebo C1 - Snacks & Fast Food", False, [
        ("Veg Puff", 20, True, "snacks"),
        ("Samosa (2 pcs)", 20, True, "snacks"),
        ("Chicken Cutlet", 35, False, "snacks"),
        ("Paneer Roll", 50, True, "snacks"),
        ("Fresh Lime Juice", 30, True, "beverages"),
        ("Tandoori Roti Combo", 70, True, "meals")
    ]),
    ("g2", G, "Gazebo C2 - Desserts & Sweets", False, [
        ("Gulab Jamun (2 pcs)", 30, True, "desserts"),
        ("Rasgulla", 30, True, "desserts"),
        ("Fruit Salad with Ice Cream", 65, True, "desserts"),
        ("Watermelon Juice", 30, True, "beverages"),
        ("Pineapple Juice", 35, True, "beverages"),
        ("Mysurpa", 25, True, "desserts")
    ]),
    ("g3", G, "Dakshin Chitra (Gazebo C3)", False, [
        ("Veg Fried Rice", 80, True, "meals"),
        ("Chicken Fried Rice", 110, False, "meals"),
        ("Egg Noodles", 90, False, "meals"),
        ("Chilli Chicken", 120, False, "starters"),
        ("Schezwan Veg Noodles", 85, True, "meals"),
        ("Gobi Manchurian", 90, True, "starters")
    ]),
    ("g4", G, "Lassi House (Gazebo C4)", False, [
        ("Sweet Lassi", 45, True, "beverages"),
        ("Mango Lassi", 55, True, "beverages"),
        ("Oreo Milkshake", 70, True, "beverages"),
        ("Cold Coffee with Ice Cream", 70, True, "beverages"),
        ("Chocolate Sundae", 90, True, "desserts"),
        ("KitKat Shake", 80, True, "beverages")
    ]),

    # Location 2: North Square
    ("n1", N, "Georgia (North Square C1)", False, [
        ("Masala Tea", 15, True, "beverages"),
        ("Filter Coffee", 18, True, "beverages"),
        ("Plain Maggi", 35, True, "snacks"),
        ("Cheese Maggi", 50, True, "snacks"),
        ("Schezwan Maggi", 45, True, "snacks"),
        ("Bun Maska", 25, True, "snacks")
    ]),
    ("n2", N, "Alpha Non-Veg (North Square C2)", False, [
        ("Chicken 65", 100, False, "starters"),
        ("Egg Biryani", 90, False, "meals"),
        ("Chicken Biryani", 130, False, "meals"),
        ("Chicken Shawarma Roll", 90, False, "snacks"),
        ("Pepper Chicken Fry", 120, False, "starters")
    ]),
    ("n3", N, "Sri's (North Square C3)", False, [
        ("Paneer Butter Masala + Naan (2)", 110, True, "meals"),
        ("White Sauce Pasta", 95, True, "meals"),
        ("Red Sauce Pasta", 90, True, "meals"),
        ("Chole Bhature", 85, True, "meals"),
        ("Softy Ice Cream Cone", 30, True, "desserts")
    ]),
    ("n4", N, "Juice & Rice Corner (North Square C4)", False, [
        ("Mosambi Juice", 35, True, "beverages"),
        ("Fresh Orange Juice", 40, True, "beverages"),
        ("Curd Rice with Pickle", 50, True, "meals"),
        ("Lemon Rice", 50, True, "meals"),
        ("Sambar Rice", 55, True, "meals")
    ]),

    # Location 3: AB3 Amphitheatre
    ("ab3", A3, "AB3 Amphitheatre Kitchen", False, [
        ("Idli (3 pcs) + Vada", 45, True, "breakfast"),
        ("Masala Dosa", 55, True, "breakfast"),
        ("Onion Uthappam", 60, True, "breakfast"),
        ("Full South Indian Veg Meal", 90, True, "lunch"),
        ("Mini Veg Meals", 65, True, "lunch"),
        ("Veg Chapathi Combo (3 pcs)", 55, True, "dinner"),
        ("Fresh Grape Juice", 35, True, "beverages"),
        ("Ice Cream Cup", 30, True, "desserts")
    ]),

    # Location 4: AB1 Canteen
    ("ab1", A, "AB1 Canteen", False, [
        ("Veg Club Sandwich", 40, True, "snacks"),
        ("Grilled Cheese Sandwich", 55, True, "snacks"),
        ("Hot Samosa (2 pcs)", 30, True, "snacks"),
        ("Masala Tea", 15, True, "beverages")
    ]),

    # Location 5: AB2 Georgia Canteen
    ("ab2", A, "AB2 Georgia Canteen", False, [
        ("Veg Puff", 20, True, "snacks"),
        ("Egg Puff", 25, False, "snacks"),
        ("Hot Filter Coffee", 18, True, "beverages"),
        ("Chocolate Chip Cookie", 25, True, "snacks"),
        ("Blueberry Muffin", 35, True, "snacks")
    ]),

    # Dairy & Stores
    ("av", S, "Aavin Centre", False, [
        ("Flavored Milk Bottle (Pista/Badam)", 35, True, "beverages"),
        ("Chocolate Milkshake", 45, True, "beverages"),
        ("Mango Lassi Pouch", 30, True, "beverages"),
        ("Aavin Kulfi Bar", 25, True, "desserts"),
        ("Ice Cream Sandwich", 35, True, "desserts"),
        ("Spiced Butter Milk", 15, True, "beverages")
    ]),
    ("vm", S, "V Mart Provisional Store", False, [
        ("Unibic Butter Cookies", 25, True, "store"),
        ("Lays Magic Masala Chips", 20, True, "store"),
        ("Classmate Long Notebook", 60, True, "store"),
        ("Parker Vector Pen", 70, True, "store"),
        ("Mineral Water 1L", 20, True, "store"),
        ("Cadbury Dairy Milk Silk", 80, True, "store")
    ]),

    # 20 Riviera Event Stalls (Active in Event Mode)
    ("e1", E, "Momo Point (Stall 01)", True, [("Steamed Veg Momos", 60, True, "event"), ("Fried Chicken Momos", 80, False, "event"), ("Cheese Momos", 90, True, "event")]),
    ("e2", E, "Pizza Craze (Stall 02)", True, [("Margherita Slice", 50, True, "event"), ("Loaded Chicken Pizza Slice", 75, False, "event"), ("Garlic Bread", 40, True, "event")]),
    ("e3", E, "Chill & Freeze Mocktails (Stall 03)", True, [("Watermelon Refresher", 30, True, "event"), ("Fresh Sugarcane Juice", 25, True, "event"), ("Virgin Mint Mojito", 45, True, "event")]),
    ("e4", E, "Shawarma Hub (Stall 04)", True, [("Classic Chicken Shawarma", 90, False, "event"), ("Jumbo Cheese Shawarma", 110, False, "event")]),
    ("e5", E, "Waffle World (Stall 05)", True, [("Belgian Chocolate Waffle", 90, True, "event"), ("Nutella Banana Waffle", 110, True, "event")]),
    ("e6", E, "Taco Fiesta (Stall 06)", True, [("Crispy Veg Tacos (2)", 75, True, "event"), ("Cheesy Chicken Tacos (2)", 95, False, "event")]),
    ("e7", E, "Churros & Ice Cream (Stall 07)", True, [("Cinnamon Churros with Dip", 70, True, "event"), ("Vanilla Softy Fudge", 40, True, "event")]),
    ("e8", E, "Biryani Express (Stall 08)", True, [("Mini Chicken Biryani", 99, False, "event"), ("Veg Dum Biryani", 79, True, "event")]),
    ("e9", E, "Kebab Corner (Stall 09)", True, [("Chicken Seekh Kebab", 110, False, "event"), ("Paneer Tikka Roll", 85, True, "event")]),
    ("e10", E, "Bubble Tea Haven (Stall 10)", True, [("Taro Milk Bubble Tea", 95, True, "event"), ("Boba Mango Smoothie", 90, True, "event")]),
    ("e11", E, "Twister Potato & Spirals (Stall 11)", True, [("Peri Peri Potato Spiral", 50, True, "event"), ("Cheesy Potato Tornado", 60, True, "event")]),
    ("e12", E, "Bombay Frankie Station (Stall 12)", True, [("Aloo Cheese Frankie", 45, True, "event"), ("Schezwan Chicken Frankie", 65, False, "event")]),
    ("e13", E, "Gourmet Burger Joint (Stall 13)", True, [("Double Cheese Veg Burger", 70, True, "event"), ("Crispy Chicken Burger", 90, False, "event")]),
    ("e14", E, "Artisan Pasta Point (Stall 14)", True, [("Creamy Alfredo Penne", 85, True, "event"), ("Arrabbiata Red Sauce Pasta", 80, True, "event")]),
    ("e15", E, "Spot Dosa Express (Stall 15)", True, [("Cheese Burst Dosa", 65, True, "event"), ("Chocolate Dosa", 60, True, "event")]),
    ("e16", E, "Delhi Chaat Bazaar (Stall 16)", True, [("Pani Puri (8 pcs)", 35, True, "event"), ("Dahi Puri", 50, True, "event"), ("Sev Puri", 45, True, "event")]),
    ("e17", E, "Dessert Studio (Stall 17)", True, [("Sizzling Brownie with Ice Cream", 120, True, "event"), ("Red Velvet Cupcake", 50, True, "event")]),
    ("e18", E, "Grilled Sandwich Craft (Stall 18)", True, [("Paneer Corn Cheese Sandwich", 60, True, "event"), ("Chicken Club Sandwich", 75, False, "event")]),
    ("e19", E, "Loaded Fries Factory (Stall 19)", True, [("Cheesy Loaded Fries", 65, True, "event"), ("Chicken Popcorn Fries", 85, False, "event")]),
    ("e20", E, "Tropical Juice Land (Stall 20)", True, [("Fresh Mango Shake", 50, True, "event"), ("Mixed Fruit Juice", 40, True, "event")])
]

for oid, loc, name, ev, items in DATA:
    sb.table("outlets").upsert({"id": oid, "location": loc, "name": name, "is_event": bool(ev)}).execute()
    sb.table("menu_items").delete().eq("outlet_id", oid).execute()
    for item in items:
        n, p = item[0], item[1]
        is_veg = item[2] if len(item) > 2 else True
        cat = item[3] if len(item) > 3 else "general"
        sb.table("menu_items").insert({
            "outlet_id": oid,
            "name": n,
            "price": p,
            "is_veg": is_veg,
            "category": cat
        }).execute()

print(f"Successfully seeded {len(DATA)} outlets (including 20 Event Stalls) for VIT Chennai!")
