// Centralized mock data and local storage manager for orders, support queries, and notification logs

const INITIAL_MOCK_ORDERS = [
  {
    _id: "ORD-9021",
    customerName: "Ananya Sharma",
    customerEmail: "ananya.sharma@gmail.com",
    customerPhone: "+91 98765 43210",
    productName: "Premium Orthopedic Dog Bed",
    category: "accessories",
    quantity: 1,
    price: 2499,
    date: new Date().toISOString().split('T')[0],
    time: "10:30 AM",
    status: "pending",
    paymentMethod: "UPI"
  },
  {
    _id: "ORD-8942",
    customerName: "Rohan Verma",
    customerEmail: "rohan.verma@yahoo.com",
    customerPhone: "+91 99112 23344",
    productName: "Pedigree Pro Dog Food - 10kg",
    category: "food",
    quantity: 2,
    price: 3798,
    date: new Date().toISOString().split('T')[0],
    time: "11:15 AM",
    status: "shipped",
    paymentMethod: "Credit Card"
  },
  {
    _id: "ORD-8812",
    customerName: "Priya Patel",
    customerEmail: "priya.patel@gmail.com",
    customerPhone: "+91 91234 56789",
    productName: "Squeaky Rubber Duck Toy",
    category: "toys",
    quantity: 3,
    price: 747,
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
    time: "03:40 PM",
    status: "delivered",
    paymentMethod: "Cash on Delivery"
  },
  {
    _id: "ORD-8715",
    customerName: "Kabir Mehta",
    customerEmail: "kabir.mehta@outlook.com",
    customerPhone: "+91 88776 65544",
    productName: "Calcium Supplement Syrup - 200ml",
    category: "medicines",
    quantity: 1,
    price: 499,
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
    time: "01:20 PM",
    status: "delivered",
    paymentMethod: "UPI"
  },
  {
    _id: "ORD-8651",
    customerName: "Neha Gupta",
    customerEmail: "neha.gupta@gmail.com",
    customerPhone: "+91 77665 54433",
    productName: "Anti-Tick Dog Shampoo - 500ml",
    category: "accessories",
    quantity: 1,
    price: 650,
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0], // 3 days ago
    time: "09:45 AM",
    status: "cancelled",
    paymentMethod: "Net Banking"
  },
  {
    _id: "ORD-8519",
    customerName: "Aditya Roy",
    customerEmail: "aditya.roy@gmail.com",
    customerPhone: "+91 90088 77665",
    productName: "Tough Chew Rope Toy XL",
    category: "toys",
    quantity: 2,
    price: 1198,
    date: new Date(Date.now() - 345600000).toISOString().split('T')[0], // 4 days ago
    time: "06:10 PM",
    status: "delivered",
    paymentMethod: "UPI"
  }
];

export const getMockOrders = () => {
  const stored = localStorage.getItem("pwc_mock_orders");
  if (!stored) {
    localStorage.setItem("pwc_mock_orders", JSON.stringify(INITIAL_MOCK_ORDERS));
    return INITIAL_MOCK_ORDERS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_MOCK_ORDERS;
  }
};

export const saveMockOrders = (orders) => {
  localStorage.setItem("pwc_mock_orders", JSON.stringify(orders));
};

export const updateOrderStatus = (orderId, newStatus) => {
  const orders = getMockOrders();
  const updated = orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o);
  saveMockOrders(updated);
  return updated;
};

export const addMockOrder = (order) => {
  const orders = getMockOrders();
  const newOrder = {
    _id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: "pending",
    ...order
  };
  orders.unshift(newOrder);
  saveMockOrders(orders);
  return orders;
};
