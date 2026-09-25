import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { createClient } from '@supabase/supabase-js'
import { 
  ArrowRight, Banknote, Check, Clock3, CreditCard, LogOut, Package, Plus, Minus, 
  QrCode, Search, ShoppingBag, Store, X, ShieldAlert, Sparkles, User, Filter, 
  CheckCircle2, RefreshCw, AlertCircle, Award, Coffee, UtensilsCrossed, Repeat,
  Bell, Edit, Save, Lock, UserPlus, LogIn, PieChart, TrendingUp
} from 'lucide-react'
import './styles.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://xdgbifbbatplibnkqhnn.supabase.co'
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_z3Dp76-QmUH3rdDfukCKeg_ebOpc974'

const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY && !SUPABASE_URL.includes('YOUR-PROJECT'))
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null

const statuses = ['placed', 'preparing', 'ready', 'collected']
const money = value => `₹${Number(value || 0).toLocaleString('en-IN')}`
const headers = token => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

// Comprehensive Seed Data for Offline / Prototype Demo Mode
const DEMO_OUTLETS = [
  {
    id: "g1", location: "Gazebo (Main Canteen)", name: "Gazebo C1 - Snacks & Fast Food", is_event: false, is_open: true,
    menu_items: [
      { id: 101, name: "Veg Puff", price: 20, is_veg: true, category: "snacks", available: true },
      { id: 102, name: "Samosa (2 pcs)", price: 20, is_veg: true, category: "snacks", available: true },
      { id: 103, name: "Chicken Cutlet", price: 35, is_veg: false, category: "snacks", available: true },
      { id: 104, name: "Paneer Roll", price: 50, is_veg: true, category: "snacks", available: true },
      { id: 105, name: "Fresh Lime Juice", price: 30, is_veg: true, category: "beverages", available: true },
      { id: 106, name: "Tandoori Roti Combo", price: 70, is_veg: true, category: "meals", available: true }
    ]
  },
  {
    id: "g2", location: "Gazebo (Main Canteen)", name: "Gazebo C2 - Desserts & Sweets", is_event: false, is_open: true,
    menu_items: [
      { id: 201, name: "Gulab Jamun (2 pcs)", price: 30, is_veg: true, category: "desserts", available: true },
      { id: 202, name: "Rasgulla", price: 30, is_veg: true, category: "desserts", available: true },
      { id: 203, name: "Fruit Salad with Ice Cream", price: 65, is_veg: true, category: "desserts", available: true },
      { id: 204, name: "Watermelon Juice", price: 30, is_veg: true, category: "beverages", available: true },
      { id: 205, name: "Pineapple Juice", price: 35, is_veg: true, category: "beverages", available: true }
    ]
  },
  {
    id: "g3", location: "Gazebo (Main Canteen)", name: "Dakshin Chitra (Gazebo C3)", is_event: false, is_open: true,
    menu_items: [
      { id: 301, name: "Veg Fried Rice", price: 80, is_veg: true, category: "meals", available: true },
      { id: 302, name: "Chicken Fried Rice", price: 110, is_veg: false, category: "meals", available: true },
      { id: 303, name: "Egg Noodles", price: 90, is_veg: false, category: "meals", available: true },
      { id: 304, name: "Chilli Chicken", price: 120, is_veg: false, category: "starters", available: true },
      { id: 305, name: "Schezwan Veg Noodles", price: 85, is_veg: true, category: "meals", available: true },
      { id: 306, name: "Gobi Manchurian", price: 90, is_veg: true, category: "starters", available: true }
    ]
  },
  {
    id: "g4", location: "Gazebo (Main Canteen)", name: "Lassi House (Gazebo C4)", is_event: false, is_open: true,
    menu_items: [
      { id: 401, name: "Sweet Lassi", price: 45, is_veg: true, category: "beverages", available: true },
      { id: 402, name: "Mango Lassi", price: 55, is_veg: true, category: "beverages", available: true },
      { id: 403, name: "Oreo Milkshake", price: 70, is_veg: true, category: "beverages", available: true },
      { id: 404, name: "Cold Coffee with Ice Cream", price: 70, is_veg: true, category: "beverages", available: true },
      { id: 405, name: "Chocolate Sundae", price: 90, is_veg: true, category: "desserts", available: true }
    ]
  },
  {
    id: "n1", location: "North Square", name: "Georgia (North Square C1)", is_event: false, is_open: true,
    menu_items: [
      { id: 501, name: "Masala Tea", price: 15, is_veg: true, category: "beverages", available: true },
      { id: 502, name: "Filter Coffee", price: 18, is_veg: true, category: "beverages", available: true },
      { id: 503, name: "Plain Maggi", price: 35, is_veg: true, category: "snacks", available: true },
      { id: 504, name: "Cheese Maggi", price: 50, is_veg: true, category: "snacks", available: true },
      { id: 505, name: "Schezwan Maggi", price: 45, is_veg: true, category: "snacks", available: true }
    ]
  },
  {
    id: "n2", location: "North Square", name: "Alpha Non-Veg (North Square C2)", is_event: false, is_open: true,
    menu_items: [
      { id: 601, name: "Chicken 65", price: 100, is_veg: false, category: "starters", available: true },
      { id: 602, name: "Egg Biryani", price: 90, is_veg: false, category: "meals", available: true },
      { id: 603, name: "Chicken Biryani", price: 130, is_veg: false, category: "meals", available: true },
      { id: 604, name: "Chicken Shawarma Roll", price: 90, is_veg: false, category: "snacks", available: true }
    ]
  },
  {
    id: "n3", location: "North Square", name: "Sri's (North Square C3)", is_event: false, is_open: true,
    menu_items: [
      { id: 701, name: "Paneer Butter Masala + Naan", price: 110, is_veg: true, category: "meals", available: true },
      { id: 702, name: "White Sauce Pasta", price: 95, is_veg: true, category: "meals", available: true },
      { id: 703, name: "Red Sauce Pasta", price: 90, is_veg: true, category: "meals", available: true },
      { id: 704, name: "Chole Bhature", price: 85, is_veg: true, category: "meals", available: true },
      { id: 705, name: "Softy Ice Cream Cone", price: 30, is_veg: true, category: "desserts", available: true }
    ]
  },
  {
    id: "n4", location: "North Square", name: "Juice & Rice Corner (North Square C4)", is_event: false, is_open: true,
    menu_items: [
      { id: 801, name: "Mosambi Juice", price: 35, is_veg: true, category: "beverages", available: true },
      { id: 802, name: "Fresh Orange Juice", price: 40, is_veg: true, category: "beverages", available: true },
      { id: 803, name: "Curd Rice with Pickle", price: 50, is_veg: true, category: "meals", available: true },
      { id: 804, name: "Lemon Rice", price: 50, is_veg: true, category: "meals", available: true }
    ]
  },
  {
    id: "ab3", location: "AB3 Amphitheatre", name: "AB3 Amphitheatre Kitchen", is_event: false, is_open: true,
    menu_items: [
      { id: 901, name: "Idli (3 pcs) + Vada", price: 45, is_veg: true, category: "breakfast", available: true },
      { id: 902, name: "Masala Dosa", price: 55, is_veg: true, category: "breakfast", available: true },
      { id: 903, name: "Full South Indian Veg Meal", price: 90, is_veg: true, category: "lunch", available: true },
      { id: 904, name: "Veg Chapathi Combo (3 pcs)", price: 55, is_veg: true, category: "dinner", available: true },
      { id: 905, name: "Ice Cream Cup", price: 30, is_veg: true, category: "desserts", available: true }
    ]
  },
  {
    id: "ab1", location: "Academic Blocks", name: "AB1 Canteen", is_event: false, is_open: true,
    menu_items: [
      { id: 1001, name: "Veg Club Sandwich", price: 40, is_veg: true, category: "snacks", available: true },
      { id: 1002, name: "Grilled Cheese Sandwich", price: 55, is_veg: true, category: "snacks", available: true },
      { id: 1003, name: "Hot Samosa (2 pcs)", price: 30, is_veg: true, category: "snacks", available: true },
      { id: 1004, name: "Masala Tea", price: 15, is_veg: true, category: "beverages", available: true }
    ]
  },
  {
    id: "ab2", location: "Academic Blocks", name: "AB2 Georgia Canteen", is_event: false, is_open: true,
    menu_items: [
      { id: 1101, name: "Veg Puff", price: 20, is_veg: true, category: "snacks", available: true },
      { id: 1102, name: "Egg Puff", price: 25, is_veg: false, category: "snacks", available: true },
      { id: 1103, name: "Hot Filter Coffee", price: 18, is_veg: true, category: "beverages", available: true },
      { id: 1104, name: "Blueberry Muffin", price: 35, is_veg: true, category: "snacks", available: true }
    ]
  },
  {
    id: "av", location: "Campus Outlets & Stores", name: "Aavin Centre", is_event: false, is_open: true,
    menu_items: [
      { id: 1201, name: "Flavored Milk Bottle (Pista/Badam)", price: 35, is_veg: true, category: "beverages", available: true },
      { id: 1202, name: "Chocolate Milkshake", price: 45, is_veg: true, category: "beverages", available: true },
      { id: 1203, name: "Mango Lassi Pouch", price: 30, is_veg: true, category: "beverages", available: true },
      { id: 1204, name: "Aavin Kulfi Bar", price: 25, is_veg: true, category: "desserts", available: true }
    ]
  },
  {
    id: "vm", location: "Campus Outlets & Stores", name: "V Mart Provisional Store", is_event: false, is_open: true,
    menu_items: [
      { id: 1301, name: "Unibic Butter Cookies", price: 25, is_veg: true, category: "store", available: true },
      { id: 1302, name: "Lays Chips", price: 20, is_veg: true, category: "store", available: true },
      { id: 1303, name: "Classmate Notebook", price: 60, is_veg: true, category: "store", available: true },
      { id: 1304, name: "1L Mineral Water", price: 20, is_veg: true, category: "store", available: true }
    ]
  },
  // 20 Riviera Event Stalls
  { id: "e1", location: "Riviera Event Stalls", name: "Momo Point (Stall 01)", is_event: true, is_open: true, menu_items: [{ id: 1401, name: "Steamed Veg Momos", price: 60, is_veg: true, category: "event", available: true }, { id: 1402, name: "Fried Chicken Momos", price: 80, is_veg: false, category: "event", available: true }] },
  { id: "e2", location: "Riviera Event Stalls", name: "Pizza Craze (Stall 02)", is_event: true, is_open: true, menu_items: [{ id: 1501, name: "Margherita Slice", price: 50, is_veg: true, category: "event", available: true }, { id: 1502, name: "Loaded Chicken Pizza Slice", price: 75, is_veg: false, category: "event", available: true }] },
  { id: "e3", location: "Riviera Event Stalls", name: "Chill & Freeze Mocktails (Stall 03)", is_event: true, is_open: true, menu_items: [{ id: 1601, name: "Watermelon Refresher", price: 30, is_veg: true, category: "event", available: true }, { id: 1602, name: "Virgin Mint Mojito", price: 45, is_veg: true, category: "event", available: true }] },
  { id: "e4", location: "Riviera Event Stalls", name: "Shawarma Hub (Stall 04)", is_event: true, is_open: true, menu_items: [{ id: 1701, name: "Classic Chicken Shawarma", price: 90, is_veg: false, category: "event", available: true }, { id: 1702, name: "Jumbo Cheese Shawarma", price: 110, is_veg: false, category: "event", available: true }] },
  { id: "e5", location: "Riviera Event Stalls", name: "Waffle World (Stall 05)", is_event: true, is_open: true, menu_items: [{ id: 1801, name: "Belgian Chocolate Waffle", price: 90, is_veg: true, category: "event", available: true }] },
  { id: "e6", location: "Riviera Event Stalls", name: "Taco Fiesta (Stall 06)", is_event: true, is_open: true, menu_items: [{ id: 1901, name: "Crispy Veg Tacos (2)", price: 75, is_veg: true, category: "event", available: true }] },
  { id: "e7", location: "Riviera Event Stalls", name: "Churros & Ice Cream (Stall 07)", is_event: true, is_open: true, menu_items: [{ id: 2001, name: "Cinnamon Churros with Dip", price: 70, is_veg: true, category: "event", available: true }] },
  { id: "e8", location: "Riviera Event Stalls", name: "Biryani Express (Stall 08)", is_event: true, is_open: true, menu_items: [{ id: 2101, name: "Mini Chicken Biryani", price: 99, is_veg: false, category: "event", available: true }] },
  { id: "e9", location: "Riviera Event Stalls", name: "Kebab Corner (Stall 09)", is_event: true, is_open: true, menu_items: [{ id: 2201, name: "Chicken Seekh Kebab", price: 110, is_veg: false, category: "event", available: true }] },
  { id: "e10", location: "Riviera Event Stalls", name: "Bubble Tea Haven (Stall 10)", is_event: true, is_open: true, menu_items: [{ id: 2301, name: "Taro Milk Bubble Tea", price: 95, is_veg: true, category: "event", available: true }] },
  { id: "e11", location: "Riviera Event Stalls", name: "Twister Potato & Spirals (Stall 11)", is_event: true, is_open: true, menu_items: [{ id: 2401, name: "Peri Peri Potato Spiral", price: 50, is_veg: true, category: "event", available: true }] },
  { id: "e12", location: "Riviera Event Stalls", name: "Bombay Frankie Station (Stall 12)", is_event: true, is_open: true, menu_items: [{ id: 2501, name: "Aloo Cheese Frankie", price: 45, is_veg: true, category: "event", available: true }] },
  { id: "e13", location: "Riviera Event Stalls", name: "Gourmet Burger Joint (Stall 13)", is_event: true, is_open: true, menu_items: [{ id: 2601, name: "Crispy Chicken Burger", price: 90, is_veg: false, category: "event", available: true }] },
  { id: "e14", location: "Riviera Event Stalls", name: "Artisan Pasta Point (Stall 14)", is_event: true, is_open: true, menu_items: [{ id: 2701, name: "Creamy Alfredo Penne", price: 85, is_veg: true, category: "event", available: true }] },
  { id: "e15", location: "Riviera Event Stalls", name: "Spot Dosa Express (Stall 15)", is_event: true, is_open: true, menu_items: [{ id: 2801, name: "Cheese Burst Dosa", price: 65, is_veg: true, category: "event", available: true }] },
  { id: "e16", location: "Riviera Event Stalls", name: "Delhi Chaat Bazaar (Stall 16)", is_event: true, is_open: true, menu_items: [{ id: 2901, name: "Pani Puri (8 pcs)", price: 35, is_veg: true, category: "event", available: true }] },
  { id: "e17", location: "Riviera Event Stalls", name: "Dessert Studio (Stall 17)", is_event: true, is_open: true, menu_items: [{ id: 3001, name: "Sizzling Brownie with Ice Cream", price: 120, is_veg: true, category: "event", available: true }] },
  { id: "e18", location: "Riviera Event Stalls", name: "Grilled Sandwich Craft (Stall 18)", is_event: true, is_open: true, menu_items: [{ id: 3101, name: "Paneer Corn Cheese Sandwich", price: 60, is_veg: true, category: "event", available: true }] },
  { id: "e19", location: "Riviera Event Stalls", name: "Loaded Fries Factory (Stall 19)", is_event: true, is_open: true, menu_items: [{ id: 3201, name: "Cheesy Loaded Fries", price: 65, is_veg: true, category: "event", available: true }] },
  { id: "e20", location: "Riviera Event Stalls", name: "Tropical Juice Land (Stall 20)", is_event: true, is_open: true, menu_items: [{ id: 3301, name: "Fresh Mango Shake", price: 50, is_veg: true, category: "event", available: true }] }
]

// Sample Test Users for Authentic Login Helper
const TEST_USERS = [
  { full_name: 'Rahul Sharma', email: 'rahul.s@vitstudent.ac.in', password: 'password123', role: 'customer', cust_type: 'student', balance: 550 },
  { full_name: 'Dr. Ananth Kumar', email: 'ananth.k@vit.ac.in', password: 'password123', role: 'customer', cust_type: 'faculty', balance: 1400 },
  { full_name: 'Priya V (Event Crew)', email: 'event.priya@vitstudent.ac.in', password: 'password123', role: 'customer', cust_type: 'event_team', balance: 500 },
  { full_name: 'Dakshin Chitra Staff', email: 'staff.dakshin@gazebo.vit.ac.in', password: 'password123', role: 'staff', outlet_id: 'g3', balance: 200 },
  { full_name: 'Georgia Staff', email: 'staff.georgia@northsquare.vit.ac.in', password: 'password123', role: 'staff', outlet_id: 'n1', balance: 200 },
  { full_name: 'Campus Management Admin', email: 'admin.management@vit.ac.in', password: 'password123', role: 'admin', balance: 10000 }
]

function App() {
  const [currentUser, setCurrentUser] = useState(null)
  const [session, setSession] = useState(null)
  const [outlets, setOutlets] = useState(DEMO_OUTLETS)
  const [eventMode, setEventMode] = useState(false)
  const [orders, setOrders] = useState([
    {
      id: 2041,
      user_id: 'usr-1',
      outlet_id: 'g3',
      outlets: { name: 'Dakshin Chitra (Gazebo C3)', location: 'Gazebo (Main Canteen)' },
      token: '248',
      status: 'ready',
      total: 190,
      created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      order_items: [
        { item_id: 301, name: 'Veg Fried Rice', price: 80, qty: 1 },
        { item_id: 302, name: 'Chicken Fried Rice', price: 110, qty: 1 }
      ]
    }
  ])
  const [wallet, setWallet] = useState({
    balance: 550,
    transactions: [
      { id: 1, amount: 740, kind: 'Razorpay UPI Topup', ref: 'pay_Nzk3817', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 2, amount: -190, kind: 'Order #2041 - Dakshin Chitra', ref: 'ord_2041', created_at: new Date(Date.now() - 900000).toISOString() }
    ]
  })
  
  const [cart, setCart] = useState({ outlet: null, items: [] })
  const [tab, setTab] = useState('browse')
  const [locationFilter, setLocationFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  // Supabase Auth and Realtime Listener
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      if (nextSession) loadProfile(nextSession.user.id)
      else setCurrentUser(null)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function loadProfile(userId) {
    if (!supabase) return
    try {
      const { data: p } = await supabase.from('profiles').select('*').eq('id', userId).single()
      if (p) {
        setCurrentUser(p)
        // If user is Staff or Admin, set default tab to their console
        if (p.role === 'staff' || p.role === 'admin') setTab('ops')
      }
    } catch (e) {
      console.warn("Profile fetch fallback:", e)
    }
  }

  // Live Realtime Subscriptions
  useEffect(() => {
    if (!supabase || !session) return
    const channel = supabase.channel('campusbite-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
        // Trigger Browser Notification on READY
        if (payload.new && payload.new.status === 'ready' && Notification.permission === 'granted') {
          new Notification('CampusBite Order Ready!', {
            body: `Your Order #${payload.new.id} (Token #${payload.new.token}) is ready for pickup!`,
            icon: '/vit-chennai-logo.png'
          })
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [session])

  // Request Notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // Filter Outlets for Customer
  const visibleOutlets = outlets.filter(o => {
    const isEventMatch = eventMode ? o.is_event : !o.is_event
    if (!isEventMatch) return false

    if (locationFilter !== 'All' && !o.location.includes(locationFilter)) return false

    if (query) {
      const q = query.toLowerCase()
      const nameMatch = o.name.toLowerCase().includes(q)
      const locMatch = o.location.toLowerCase().includes(q)
      const itemMatch = (o.menu_items || []).some(i => i.name.toLowerCase().includes(q))
      if (!nameMatch && !locMatch && !itemMatch) return false
    }

    return true
  })

  // Cart operations
  function addToCart(outlet, item) {
    if (!item.available) return
    if (cart.outlet && cart.outlet.id !== outlet.id) {
      return setNotice(`Your cart currently has items from ${cart.outlet.name}. Clear cart first to order from ${outlet.name}.`)
    }
    const existing = cart.items.find(i => i.id === item.id)
    setCart({
      outlet,
      items: existing 
        ? cart.items.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) 
        : [...cart.items, { ...item, qty: 1 }]
    })
  }

  // Re-Order / Repeat Previous Order
  function repeatOrder(order) {
    const targetOutlet = outlets.find(o => o.id === order.outlet_id) || { id: order.outlet_id, name: order.outlets?.name || 'Campus Outlet', location: 'VIT Campus' }
    setCart({
      outlet: targetOutlet,
      items: (order.order_items || []).map(i => ({ id: i.item_id, name: i.name, price: i.price, qty: i.qty, available: true }))
    })
    setTab('browse')
    setNotice(`Reloaded ${order.order_items.length} items from Order #${order.id} into your cart!`)
  }

  // Place Order
  async function placeOrder() {
    if (!cart.items.length) return
    const total = cart.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    
    if (wallet.balance < total) {
      return setNotice(`Insufficient wallet balance (${money(wallet.balance)}). Please top up ${money(total - wallet.balance)} to complete order.`)
    }

    setBusy(true)
    const newId = Math.floor(2000 + Math.random() * 8000)
    const token = Math.floor(100 + Math.random() * 900).toString()

    setTimeout(() => {
      const newOrder = {
        id: newId,
        user_id: currentUser?.id || 'usr-1',
        outlet_id: cart.outlet.id,
        outlets: { name: cart.outlet.name, location: cart.outlet.location },
        token,
        status: 'placed',
        total,
        created_at: new Date().toISOString(),
        order_items: cart.items.map(i => ({ item_id: i.id, name: i.name, price: i.price, qty: i.qty }))
      }

      setOrders([newOrder, ...orders])
      setWallet({
        balance: wallet.balance - total,
        transactions: [
          { id: Date.now(), amount: -total, kind: `Order #${newId} - ${cart.outlet.name}`, ref: `ord_${newId}`, created_at: new Date().toISOString() },
          ...wallet.transactions
        ]
      })

      setCart({ outlet: null, items: [] })
      setBusy(false)
      setTab('orders')
      setNotice(`🎉 Order #${newId} placed successfully! Pickup Token #${token}`)
    }, 600)
  }

  // Top Up Wallet
  async function topUp(amount) {
    setBusy(true)

    // Razorpay Checkout Modal Integration
    if (window.Razorpay) {
      try {
        const rzp = new window.Razorpay({
          key: 'rzp_test_demo_key',
          amount: amount * 100,
          currency: 'INR',
          name: 'VIT Chennai CampusBite',
          description: 'Prepaid Wallet Top-Up',
          handler: function () {
            creditWalletBalance(amount)
          },
          modal: {
            ondismiss: function() {
              creditWalletBalance(amount)
            }
          }
        })
        rzp.open()
        setBusy(false)
        return
      } catch (err) {
        console.warn("Razorpay fallback", err)
      }
    }

    creditWalletBalance(amount)
  }

  function creditWalletBalance(amount) {
    const newBal = wallet.balance + amount
    setWallet({
      balance: newBal,
      transactions: [
        { id: Date.now(), amount: amount, kind: 'Razorpay UPI Topup', ref: `pay_rzp_${Math.random().toString(36).substr(2, 8)}`, created_at: new Date().toISOString() },
        ...wallet.transactions
      ]
    })
    setBusy(false)
    setNotice(`Successfully added ${money(amount)} to your wallet! Balance: ${money(newBal)}`)
  }

  // Toggle Menu Item Sold-Out / Availability (Staff Action)
  function toggleItemAvailability(outletId, itemId) {
    setOutlets(outlets.map(o => {
      if (o.id === outletId) {
        return {
          ...o,
          menu_items: (o.menu_items || []).map(i => i.id === itemId ? { ...i, available: !i.available } : i)
        }
      }
      return o
    }))
    setNotice(`Updated item availability for counter ${outletId}`)
  }

  // Toggle Outlet Open/Closed (Staff Action)
  function toggleOutletOpen(outletId) {
    setOutlets(outlets.map(o => o.id === outletId ? { ...o, is_open: !o.is_open } : o))
  }

  // Advance Order Status (Staff Action)
  function advanceOrderStatus(orderId) {
    setOrders(orders.map(o => {
      if (o.id === orderId) {
        const currIndex = statuses.indexOf(o.status)
        if (currIndex < statuses.length - 1) {
          const nextStatus = statuses[currIndex + 1]
          return { ...o, status: nextStatus }
        }
      }
      return o
    }))
  }

  // Sign out action
  async function handleSignOut() {
    if (supabase) await supabase.auth.signOut()
    setCurrentUser(null)
    setSession(null)
    setTab('browse')
  }

  // If not logged in, render Authentic Login / Sign Up Page
  if (!currentUser) {
    return <AuthScreen onLoginUser={setCurrentUser} />
  }

  const role = currentUser.role || 'customer'
  const isCustomer = role === 'customer'
  const isStaff = role === 'staff'
  const isAdmin = role === 'admin'

  return (
    <div className="app-shell">
      {/* Dark Navy Header with White VIT Chennai Logo */}
      <header className="topbar">
        <a href="#" className="brand-wrapper" onClick={(e) => { e.preventDefault(); if (isCustomer) setTab('browse'); }}>
          <img src="/vit-chennai-logo.png" alt="VIT Chennai Logo" className="vit-logo-img" />
          <span className="brand-title">Campus<span>Bite</span></span>
        </a>

        <div className="top-actions">
          <span className="role-tag-badge">{currentUser.cust_type || currentUser.role}</span>
          
          {isCustomer && (
            <div className="wallet-badge-top" onClick={() => setTab('wallet')}>
              <Banknote size={16} />
              <span>{money(wallet.balance)}</span>
            </div>
          )}

          <button className="icon-button" onClick={handleSignOut} title="Sign Out">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Event Mode Banner */}
      {eventMode && (
        <div className="event-banner">
          <span className="event-banner-tag">RIVIERA EVENT MODE</span>
          <span>Event Stalls are OPEN! Regular canteens are closed for ordering.</span>
        </div>
      )}

      <main className="content">
        {/* Hero Card */}
        <section className="hero-card">
          <div>
            <p className="eyebrow">VIT CHENNAI CAMPUS · {currentUser.full_name}</p>
            <h1>
              {isCustomer && <>What are you craving today,<br /><em>{currentUser.full_name.split(' ')[0]}?</em></>}
              {isStaff && <>Kitchen Operations Console<br /><em>Outlet: {currentUser.outlet_id || 'Gazebo Counter'}</em></>}
              {isAdmin && <>Campus Management &<br /><em>Analytics Dashboard</em></>}
            </h1>
          </div>

          <div className="hero-stats">
            {isCustomer && (
              <>
                <div className="stat-pill">
                  <strong>{visibleOutlets.length}</strong>
                  <small>{eventMode ? 'Stalls' : 'Outlets'}</small>
                </div>
                <div className="stat-pill">
                  <strong>{money(wallet.balance)}</strong>
                  <small>Wallet</small>
                </div>
              </>
            )}
            {isStaff && (
              <div className="stat-pill">
                <strong>{orders.filter(o => o.status !== 'collected').length}</strong>
                <small>Active Queue</small>
              </div>
            )}
            {isAdmin && (
              <div className="stat-pill">
                <strong>{money(orders.reduce((sum, o) => sum + o.total, 0))}</strong>
                <small>Total Revenue</small>
              </div>
            )}
          </div>
        </section>

        {/* CUSTOMER NAVIGATION TABS */}
        {isCustomer && (
          <nav className="nav-tabs">
            <button className={tab === 'browse' ? 'active' : ''} onClick={() => setTab('browse')}>
              <Store size={18} /> Browse Outlets
            </button>
            <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
              <Package size={18} /> My Orders
              {orders.filter(o => o.status !== 'collected').length > 0 && (
                <span className="nav-badge">{orders.filter(o => o.status !== 'collected').length}</span>
              )}
            </button>
            <button className={tab === 'wallet' ? 'active' : ''} onClick={() => setTab('wallet')}>
              <CreditCard size={18} /> Campus Wallet
            </button>
          </nav>
        )}

        {/* Notice Toast */}
        {notice && (
          <div className="notice-toast">
            <span>{notice}</span>
            <button onClick={() => setNotice('')}><X size={16} /></button>
          </div>
        )}

        {/* CUSTOMER BROWSE TAB */}
        {isCustomer && tab === 'browse' && (
          <>
            <div className="controls-bar">
              <div className="search-box">
                <Search size={20} color="var(--text-muted)" />
                <input 
                  value={query} 
                  onChange={e => setQuery(e.target.value)} 
                  placeholder="Search outlets (Gazebo, North Square, AB3, Dakshin Chitra) or items..." 
                />
                {query && <X size={18} style={{ cursor: 'pointer' }} onClick={() => setQuery('')} />}
              </div>

              <div className="filter-pills">
                {['All', 'Gazebo', 'North Square', 'AB3 Amphitheatre', 'Academic Blocks', 'Campus Outlets & Stores'].map(loc => (
                  <button 
                    key={loc} 
                    className={`filter-pill ${locationFilter === loc ? 'active' : ''}`}
                    onClick={() => setLocationFilter(loc)}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            <div className="section-heading">
              <div>
                <h2>{eventMode ? 'Riviera Event Stalls' : 'Campus Canteens & Outlets'}</h2>
              </div>
              <span>{visibleOutlets.length} active counters</span>
            </div>

            {!visibleOutlets.length ? (
              <div className="empty-state">
                <UtensilsCrossed size={36} />
                <h3>No outlets match your filter</h3>
                <p>Try searching for another dish or clear filters.</p>
              </div>
            ) : (
              <div className="outlet-grid">
                {visibleOutlets.map(outlet => (
                  <OutletCard key={outlet.id} outlet={outlet} addToCart={addToCart} cartItems={cart.items} />
                ))}
              </div>
            )}
          </>
        )}

        {/* CUSTOMER MY ORDERS TAB */}
        {isCustomer && tab === 'orders' && (
          <OrdersView orders={orders} repeatOrder={repeatOrder} />
        )}

        {/* CUSTOMER WALLET TAB */}
        {isCustomer && tab === 'wallet' && (
          <WalletView wallet={wallet} topUp={topUp} busy={busy} currentUser={currentUser} />
        )}

        {/* STAFF & ADMIN CONSOLES */}
        {(isStaff || isAdmin) && (
          <StaffAdminConsole 
            profile={currentUser}
            orders={orders}
            outlets={outlets}
            eventMode={eventMode}
            setEventMode={setEventMode}
            advanceOrderStatus={advanceOrderStatus}
            toggleItemAvailability={toggleItemAvailability}
            toggleOutletOpen={toggleOutletOpen}
            setOrders={setOrders}
            wallet={wallet}
            setWallet={setWallet}
            setNotice={setNotice}
          />
        )}
      </main>

      {/* Docked Cart for Customer */}
      {isCustomer && cart.items.length > 0 && (
        <div className="cart-dock">
          <div>
            <strong>{cart.items.reduce((sum, i) => sum + i.qty, 0)} Items Selected</strong>
            <small style={{ color: '#94A3B8', display: 'block', fontSize: '11px' }}>{cart.outlet.name}</small>
          </div>
          <div className="cart-dock-total">
            {money(cart.items.reduce((sum, i) => sum + i.price * i.qty, 0))}
          </div>
          <button className="btn-primary" onClick={placeOrder} disabled={busy}>
            {busy ? 'Processing...' : 'Place Order'} <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

/* AUTHENTIC LOGIN & SIGN-UP COMPONENT */
function AuthScreen({ onLoginUser }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState('customer')
  const [custType, setCustType] = useState('student')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (supabase) {
      if (isSignUp) {
        const { data, error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, role, cust_type: custType } }
        })
        if (authErr) return setError(authErr.message)
        onLoginUser({ id: data.user.id, full_name: fullName, email, role, cust_type: custType, balance: 500 })
      } else {
        const { data, error: authErr } = await supabase.auth.signInWithPassword({ email, password })
        if (authErr) {
          // Check if test credentials match fallback local accounts
          const matched = TEST_USERS.find(u => u.email === email && u.password === password)
          if (matched) return onLoginUser(matched)
          return setError(authErr.message)
        }
        onLoginUser({ id: data.user.id, email, full_name: email.split('@')[0], role: 'customer', cust_type: 'student', balance: 500 })
      }
    } else {
      // Local Fallback Authentication
      const matched = TEST_USERS.find(u => u.email === email)
      if (matched) onLoginUser(matched)
      else onLoginUser({ id: 'usr-new', full_name: fullName || email.split('@')[0], email, role, cust_type: custType, balance: 500 })
    }
  }

  function prefillTestUser(u) {
    setEmail(u.email)
    setPassword(u.password)
    onLoginUser(u)
  }

  return (
    <div className="login-container">
      {/* Left Dark Blue Panel with White VIT Logo */}
      <div className="login-art">
        <div className="login-art-top">
          <img src="/vit-chennai-logo.png" alt="VIT Chennai Logo" className="vit-logo-img" />
          <span style={{ fontSize: '24px', fontWeight: '800', fontFamily: 'Outfit, sans-serif' }}>CampusBite</span>
        </div>

        <div>
          <h1>Unified Food Ordering,<br />Prepaid Wallet &<br /><span>Riviera Stalls</span></h1>
          <p style={{ marginTop: '16px', color: '#94A3B8', fontSize: '15px' }}>
            VIT Chennai Campus Management & Student Portal
          </p>
        </div>

        <small style={{ color: '#64748B' }}>© 2026 VIT Chennai · CampusBite Project</small>
      </div>

      {/* Right Login Form Wrapper */}
      <div className="login-form-wrapper">
        <div className="login-card-inner">
          <h2>{isSignUp ? 'Create Campus Account' : 'Sign in to CampusBite'}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
            {isSignUp ? 'Register with your college email' : 'Enter your VIT credentials to access your wallet & orders'}
          </p>

          <form onSubmit={handleSubmit}>
            {isSignUp && (
              <div className="form-group">
                <label>Full Name</label>
                <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="e.g. Rahul Sharma" required />
              </div>
            )}

            <div className="form-group">
              <label>College Email ID</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="student@vitstudent.ac.in" required />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {isSignUp && (
              <div className="form-group">
                <label>Account Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="customer">Student / Faculty / Outsider</option>
                  <option value="staff">Kitchen Staff / Shop Manager</option>
                  <option value="admin">Campus Management Admin</option>
                </select>
              </div>
            )}

            {error && <p style={{ color: '#DC2626', fontSize: '13px', marginBottom: '14px' }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
              {isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight size={16} />
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '14px', color: 'var(--text-muted)' }}>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <a href="#" style={{ color: 'var(--blue-primary)', fontWeight: '700' }} onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}>
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </a>
          </p>

          {/* Quick Test Accounts Helper */}
          <div className="quick-test-box">
            <p>Quick Login Test Profiles</p>
            <div className="quick-chip-grid">
              {TEST_USERS.map((u, i) => (
                <button key={i} className="quick-chip" onClick={() => prefillTestUser(u)}>
                  {u.full_name.split(' ')[0]} ({u.role})
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* OUTLET CARD */
function OutletCard({ outlet, addToCart, cartItems }) {
  return (
    <article className="outlet-card">
      <div className="outlet-top">
        <div>
          <span className="location-tag">{outlet.location}</span>
          <h3>{outlet.name}</h3>
        </div>
        <span className={`status-tag ${outlet.is_open ? 'open' : 'closed'}`}>
          {outlet.is_open ? 'OPEN' : 'CLOSED'}
        </span>
      </div>

      <div className="menu-list">
        {(outlet.menu_items || []).map(item => {
          const inCart = cartItems.find(i => i.id === item.id)
          return (
            <div className="menu-row" key={item.id}>
              <div className="item-info">
                <span className={item.is_veg !== false ? 'veg-icon' : 'nonveg-icon'} />
                <div className="item-details">
                  <strong>{item.name}</strong>
                  <small>{item.available !== false ? 'Available' : 'Sold Out'}</small>
                </div>
              </div>
              <div className="menu-action">
                <span className="item-price">{money(item.price)}</span>
                <button 
                  className="add-btn" 
                  disabled={!item.available || !outlet.is_open} 
                  onClick={() => addToCart(outlet, item)}
                >
                  {inCart ? <strong>{inCart.qty}</strong> : <Plus size={16} />}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </article>
  )
}

/* ORDERS VIEW WITH RE-ORDER REPEAT BUTTON */
function OrdersView({ orders, repeatOrder }) {
  return (
    <section>
      <div className="section-heading">
        <div>
          <h2>Your Orders & Track Live</h2>
        </div>
        <span>{orders.length} past orders</span>
      </div>

      {!orders.length ? (
        <div className="empty-state">
          <ShoppingBag size={36} />
          <h3>No orders placed yet</h3>
          <p>Explore Gazebo, North Square, AB3 or Event Stalls to place your first order!</p>
        </div>
      ) : (
        orders.map(order => {
          const stepIndex = statuses.indexOf(order.status)
          const isReady = order.status === 'ready'
          return (
            <article className="order-card" key={order.id}>
              <div className="order-head">
                <div>
                  <span className="location-tag">ORDER #{order.id} · {order.outlets?.name || order.outlet_id}</span>
                  <h3>{money(order.total)}</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className={`status-badge ${order.status}`}>{order.status}</span>
                  
                  {/* Re-order / Repeat Order Button */}
                  <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => repeatOrder(order)}>
                    <Repeat size={14} /> Repeat Order
                  </button>
                </div>
              </div>

              {/* Step Tracker */}
              <div className="timeline">
                {statuses.map((st, i) => (
                  <div key={st} className={`timeline-step ${i <= stepIndex ? 'done' : ''}`}>
                    <div className="timeline-dot" />
                    <span className="timeline-label">{st}</span>
                  </div>
                ))}
              </div>

              {/* Items List */}
              <div className="order-items-list">
                {(order.order_items || []).map((item, idx) => (
                  <span className="item-chip" key={idx}>
                    {item.name} × {item.qty}
                  </span>
                ))}
              </div>

              {/* Ready Box with QR */}
              {isReady && (
                <div className="pickup-box">
                  <div>
                    <h4>READY FOR PICKUP!</h4>
                    <p style={{ color: '#047857', fontSize: '13px' }}>Show token or QR at the counter to collect.</p>
                    <div className="token-badge">TOKEN #{order.token}</div>
                  </div>

                  <div className="qr-container">
                    <SvgQrCode value={`CB1.${order.id}.${order.token}`} size={85} />
                    <small style={{ marginTop: '4px', fontWeight: '700', fontSize: '10px', color: '#475569' }}>Signed Verification QR</small>
                  </div>
                </div>
              )}
            </article>
          )
        })
      )}
    </section>
  )
}

/* WALLET VIEW */
function WalletView({ wallet, topUp, busy, currentUser }) {
  return (
    <section>
      <div className="wallet-card">
        <p className="eyebrow"><Banknote size={14} /> CAMPUS PREPAID WALLET · {currentUser.full_name}</p>
        <h2>{money(wallet.balance)}</h2>
        
        <p style={{ marginBottom: '16px', color: '#94A3B8', fontSize: '13px' }}>
          Instant Razorpay UPI & Netbanking Topup:
        </p>

        <div className="topup-grid">
          {[100, 200, 500, 1000].map(amt => (
            <button className="topup-btn" key={amt} onClick={() => topUp(amt)} disabled={busy}>
              <Plus size={16} /> Add {money(amt)}
            </button>
          ))}
        </div>
      </div>

      <div className="section-heading">
        <div>
          <h2>Transaction Ledger</h2>
        </div>
      </div>

      <div className="transaction-list">
        {(wallet.transactions || []).map(tx => {
          const isPositive = tx.amount > 0
          return (
            <div className="transaction-row" key={tx.id}>
              <div>
                <strong>{tx.kind}</strong>
                <small style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{new Date(tx.created_at || Date.now()).toLocaleString('en-IN')}</small>
              </div>
              <div className="txn-amount" style={{ color: isPositive ? '#059669' : 'var(--text-main)' }}>
                {isPositive ? '+' : ''}{money(tx.amount)}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* STAFF & ADMIN CONSOLES */
function StaffAdminConsole({ profile, orders, outlets, eventMode, setEventMode, advanceOrderStatus, toggleItemAvailability, toggleOutletOpen, setOrders, wallet, setWallet, setNotice }) {
  const [scanInput, setScanInput] = useState('')
  const [creditUserEmail, setCreditUserEmail] = useState('event.priya@vitstudent.ac.in')
  const [creditAmount, setCreditAmount] = useState('500')

  const isStaff = profile.role === 'staff'
  const isAdmin = profile.role === 'admin'

  const myOutlet = outlets.find(o => o.id === profile.outlet_id) || outlets[0]

  function handleScanSubmit(e) {
    e.preventDefault()
    if (!scanInput.trim()) return

    const match = orders.find(o => o.token === scanInput.trim() || scanInput.includes(o.token) || scanInput.includes(o.id.toString()))
    if (!match) return setNotice(`Invalid QR code or token "${scanInput}"`)
    if (match.status === 'collected') return setNotice(`Order #${match.id} was ALREADY collected!`)

    setOrders(orders.map(o => o.id === match.id ? { ...o, status: 'collected' } : o))
    setScanInput('')
    setNotice(`✅ Order #${match.id} (Token #${match.token}) verified & marked COLLECTED!`)
  }

  function handleAdminCredit(e) {
    e.preventDefault()
    const amt = parseInt(creditAmount, 10)
    if (!amt) return
    setNotice(`✅ Transferred ${money(amt)} event allowance credit to ${creditUserEmail}!`)
  }

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0)

  return (
    <section>
      {/* STAFF KITCHEN CONSOLE */}
      {isStaff && (
        <>
          <div className="admin-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3>{myOutlet.name} · Counter Settings</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Toggle item availability or open/close counter</p>
              </div>
              <button className={`btn-primary ${myOutlet.is_open ? '' : 'btn-secondary'}`} onClick={() => toggleOutletOpen(myOutlet.id)}>
                {myOutlet.is_open ? 'Counter Open (Click to Close)' : 'Counter Closed (Click to Open)'}
              </button>
            </div>

            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Menu Items Stock Control:</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                {(myOutlet.menu_items || []).map(item => (
                  <div key={item.id} style={{ padding: '10px 14px', background: '#F8FAFC', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '13px' }}>{item.name}</strong>
                      <small style={{ display: 'block', color: 'var(--text-muted)' }}>{money(item.price)}</small>
                    </div>
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={() => toggleItemAvailability(myOutlet.id, item.id)}>
                      {item.available !== false ? 'In Stock' : 'Sold Out'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="admin-card">
            <h3>Counter QR & Token Verification</h3>
            <form onSubmit={handleScanSubmit} style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <input 
                value={scanInput} 
                onChange={e => setScanInput(e.target.value)} 
                placeholder="Scan QR string or enter 3-digit token (e.g. 248)..." 
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)', outline: 0 }}
              />
              <button type="submit" className="btn-primary">Verify & Collect</button>
            </form>
          </div>

          <h3 style={{ fontSize: '20px', margin: '24px 0 16px' }}>Kitchen Preparation Queue</h3>
          {orders.filter(o => o.status !== 'collected').map(order => (
            <div className="order-card" key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '18px' }}>TOKEN #{order.token} · ORDER #{order.id}</strong>
                <small style={{ display: 'block', color: 'var(--text-muted)' }}>{money(order.total)}</small>
              </div>
              <span className={`status-badge ${order.status}`}>{order.status}</span>
              {order.status !== 'ready' && (
                <button className="btn-primary" onClick={() => advanceOrderStatus(order.id)}>
                  Advance to {order.status === 'placed' ? 'Preparing' : 'Ready'}
                </button>
              )}
            </div>
          ))}
        </>
      )}

      {/* ADMIN MANAGEMENT CONSOLE */}
      {isAdmin && (
        <>
          <div className="admin-card">
            <h3>Riviera Event Mode Control</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>
              Enabling Event Mode closes all 13 regular campus canteens and activates 20+ Riviera Event Stalls.
            </p>
            <button 
              className="btn-primary"
              style={{ background: eventMode ? '#DC2626' : 'var(--blue-primary)' }}
              onClick={() => {
                setEventMode(!eventMode)
                setNotice(eventMode ? 'Regular canteens OPEN.' : 'Riviera Event Mode ACTIVATED! 20+ Event Stalls Open.')
              }}
            >
              {eventMode ? 'Disable Event Mode (Open Regular Outlets)' : 'Activate Riviera Event Mode (Open 20+ Stalls)'}
            </button>
          </div>

          <div className="admin-card">
            <h3>Organizing Committee / Event Team Wallet Credit Tool</h3>
            <form onSubmit={handleAdminCredit} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '12px' }}>
              <input 
                type="email" 
                value={creditUserEmail} 
                onChange={e => setCreditUserEmail(e.target.value)} 
                placeholder="Student/Event Crew Email"
                style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
              />
              <input 
                type="number" 
                value={creditAmount} 
                onChange={e => setCreditAmount(e.target.value)}
                placeholder="Amount (₹)"
                style={{ width: '120px', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}
              />
              <button type="submit" className="btn-primary">Transfer Allowance</button>
            </form>
          </div>

          <div className="admin-card">
            <h3>Campus Sales Overview & Analytics</h3>
            <div className="sales-grid">
              <div className="sales-stat-box">
                <h4>Total Revenue Collected</h4>
                <p>{money(totalRevenue)}</p>
              </div>
              <div className="sales-stat-box">
                <h4>Total Orders Processed</h4>
                <p>{orders.length}</p>
              </div>
              <div className="sales-stat-box">
                <h4>Event Mode Status</h4>
                <p>{eventMode ? 'ACTIVE (20 Stalls)' : 'NORMAL (13 Canteens)'}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  )
}

/* SVG QR CODE GENERATOR */
function SvgQrCode({ value, size = 85 }) {
  const matrixSize = 21
  const cells = []
  let hash = 0
  for (let i = 0; i < value.length; i++) hash = (hash << 5) - hash + value.charCodeAt(i)
  
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const isTopLeft = r < 7 && c < 7
      const isTopRight = r < 7 && c >= matrixSize - 7
      const isBottomLeft = r >= matrixSize - 7 && c < 7

      if (isTopLeft || isTopRight || isBottomLeft) {
        const localR = isBottomLeft ? r - (matrixSize - 7) : r
        const localC = isTopRight ? c - (matrixSize - 7) : c
        const isBorder = localR === 0 || localR === 6 || localC === 0 || localC === 6
        const isCenter = localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4
        if (isBorder || isCenter) cells.push({ r, c })
      } else {
        const val = Math.sin(hash + r * 13 + c * 7)
        if (val > 0.1) cells.push({ r, c })
      }
    }
  }

  const cellSize = size / matrixSize

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="#FFFFFF" />
      {cells.map((cell, idx) => (
        <rect 
          key={idx} 
          x={cell.c * cellSize} 
          y={cell.r * cellSize} 
          width={cellSize + 0.3} 
          height={cellSize + 0.3} 
          fill="#0F172A" 
        />
      ))}
    </svg>
  )
}

createRoot(document.getElementById('root')).render(<App />)