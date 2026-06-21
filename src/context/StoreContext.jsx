import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const BACKEND_URL = "https://pawconnectbackend.onrender.com";
const API_BASE = `${BACKEND_URL}/api/v1`;

const StoreContext = createContext();

export const useStore = () => useContext(StoreContext);

export const StoreProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);
  const [store, setStore] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  // Auto-close alert after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Auto-login on mount for dev environment if token is not present
  useEffect(() => {
    const autoLogin = async () => {
      if (!token) {
        setDataLoading(true);
        try {
          const res = await axios.get(`${API_BASE}/auth/dev-token`);
          if (res.data.success && res.data.data?.accessToken) {
            const { accessToken } = res.data.data;
            localStorage.setItem("token", accessToken);
            setToken(accessToken);
          }
        } catch (err) {
          console.error("Failed to automatically acquire dev token:", err);
        } finally {
          setDataLoading(false);
        }
      }
    };
    autoLogin();
  }, []);

  // Load profile and data if token exists
  useEffect(() => {
    if (token) {
      fetchDashboardData();
    } else {
      setUser(null);
      setStore(null);
      setBookings([]);
      setReviews([]);
      setNotifications([]);
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // 1. Fetch profile
      const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      let currentUser = null;
      if (profileRes.data.success && profileRes.data.data?.user) {
        currentUser = profileRes.data.data.user;
        if (currentUser.role !== "manager") {
          handleLogout();
          showAlert("danger", "Access Denied: The business console is only for Store Owners.");
          return;
        }
        setUser(currentUser);
      } else {
        throw new Error("Invalid profile response");
      }

      // 2. Fetch Store Details
      let currentStore = null;
      try {
        const storeRes = await axios.get(`${API_BASE}/stores`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (storeRes.data.success && storeRes.data.data?.store) {
          currentStore = storeRes.data.data.store;
          setStore(currentStore);
        }
      } catch (err) {
        console.warn("No store registered for this manager yet.", err);
      }

      // 3. Fetch Bookings
      try {
        const bookingsRes = await axios.get(`${API_BASE}/bookings/store-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookingsRes.data.success && bookingsRes.data.data?.bookings) {
          setBookings(bookingsRes.data.data.bookings);
        }
      } catch (err) {
        console.error("Failed to load store bookings", err);
      }

      // 4. Fetch Reviews if Store exists
      if (currentStore?._id) {
        try {
          const reviewsRes = await axios.get(`${API_BASE}/reviews/store/${currentStore._id}`);
          if (reviewsRes.data.success && reviewsRes.data.data?.reviews) {
            setReviews(reviewsRes.data.data.reviews);
          }
        } catch (err) {
          console.error("Failed to load store reviews", err);
        }
      }

      // 5. Fetch Notifications
      try {
        const notifRes = await axios.get(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (notifRes.data.success && notifRes.data.data?.notifications) {
          setNotifications(notifRes.data.data.notifications);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
      }

    } catch (err) {
      console.error("Error fetching dashboard details:", err);
      handleLogout();
      showAlert("danger", "Session expired or database connection failed. Please log in again.");
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setStore(null);
    setBookings([]);
    setReviews([]);
    setNotifications([]);
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

  // Notification methods
  const markNotificationRead = async (id) => {
    try {
      const res = await axios.put(`${API_BASE}/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await axios.put(`${API_BASE}/notifications/read-all`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        showAlert("success", "All notifications marked as read.");
      }
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
    }
  };

  // Booking action status
  const updateBookingStatus = async (bookingId, action) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/bookings/${bookingId}/${action}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        showAlert("success", `Booking successfully marked as ${action}ed!`);
        // Refresh bookings
        const bookingsRes = await axios.get(`${API_BASE}/bookings/store-bookings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (bookingsRes.data.success && bookingsRes.data.data?.bookings) {
          setBookings(bookingsRes.data.data.bookings);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to ${action} booking.`;
      showAlert("danger", msg);
    }
  };

  // Store updating
  const updateStore = async (storeData) => {
    try {
      const mergedData = store ? {
        ...store,
        ...storeData,
        address: storeData.address !== undefined ? storeData.address : store.address,
        addressDetails: storeData.addressDetails !== undefined ? storeData.addressDetails : store.addressDetails,
        ownerDetails: storeData.ownerDetails !== undefined ? storeData.ownerDetails : store.ownerDetails,
      } : storeData;

      const res = await axios.patch(`${API_BASE}/stores`, mergedData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStore(res.data.data.store);
        showAlert("success", "Store details successfully updated!");
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update store details.";
      showAlert("danger", msg);
      return false;
    }
  };

  const registerStore = async (storeData) => {
    try {
      const res = await axios.post(`${API_BASE}/stores`, storeData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setStore(res.data.data.store);
        showAlert("success", "Store registered successfully!");
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to register store.";
      showAlert("danger", msg);
      return false;
    }
  };

  // ─── DYNAMIC MODULES HELPERS ──────────────────────────────────────────────
  
  // 1. PRODUCTS
  const fetchProducts = async (category = "") => {
    try {
      const url = category 
        ? `${API_BASE}/stores/modules/products?category=${category.toLowerCase()}`
        : `${API_BASE}/stores/modules/products`;
      const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      return res.data.data?.products || [];
    } catch (err) {
      console.error("Failed to fetch products:", err);
      return [];
    }
  };

  const addProduct = async (productData) => {
    try {
      const res = await axios.post(`${API_BASE}/stores/modules/products`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Product successfully added!");
        return { success: true, product: res.data.data.product };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add product.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const updateProduct = async (productId, productData) => {
    try {
      const res = await axios.put(`${API_BASE}/stores/modules/products/${productId}`, productData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Product successfully updated!");
        return { success: true, product: res.data.data.product };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update product.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const res = await axios.delete(`${API_BASE}/stores/modules/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Product deleted successfully!");
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete product.";
      showAlert("danger", msg);
      return false;
    }
  };

  // 2. VETERINARY (DOCTORS)
  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores/modules/veterinary/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data?.doctors || [];
    } catch (err) {
      console.error("Failed to fetch doctors:", err);
      return [];
    }
  };

  const addDoctor = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/stores/modules/veterinary/doctors`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Doctor profile created successfully!");
        return { success: true, doctor: res.data.data.doctor };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add doctor.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const updateDoctor = async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE}/stores/modules/veterinary/doctors/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Doctor profile updated successfully!");
        return { success: true, doctor: res.data.data.doctor };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update doctor details.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const deleteDoctor = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/stores/modules/veterinary/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Doctor deleted successfully!");
        return true;
      }
    } catch (err) {
      showAlert("danger", "Failed to delete doctor.");
      return false;
    }
  };

  // 3. GROOMING
  const fetchGroomingPackages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores/modules/grooming/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data?.packages || [];
    } catch (err) {
      console.error("Failed to fetch grooming packages:", err);
      return [];
    }
  };

  const addGroomingPackage = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/stores/modules/grooming/packages`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Grooming package created successfully!");
        return { success: true, package: res.data.data.package };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add grooming package.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const updateGroomingPackage = async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE}/stores/modules/grooming/packages/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Grooming package updated successfully!");
        return { success: true, package: res.data.data.package };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update grooming package.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const deleteGroomingPackage = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/stores/modules/grooming/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Grooming package deleted successfully!");
        return true;
      }
    } catch (err) {
      showAlert("danger", "Failed to delete grooming package.");
      return false;
    }
  };

  // 4. DOG WALKING
  const fetchWalkers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores/modules/walking/walkers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data?.walkers || [];
    } catch (err) {
      console.error("Failed to fetch walkers:", err);
      return [];
    }
  };

  const addWalker = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/stores/modules/walking/walkers`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Walker profile added successfully!");
        return { success: true, walker: res.data.data.walker };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add walker.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const updateWalker = async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE}/stores/modules/walking/walkers/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Walker profile updated successfully!");
        return { success: true, walker: res.data.data.walker };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update walker.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const deleteWalker = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/stores/modules/walking/walkers/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Walker profile deleted successfully!");
        return true;
      }
    } catch (err) {
      showAlert("danger", "Failed to delete walker profile.");
      return false;
    }
  };

  // 5. BOARDING
  const fetchBoardingPackages = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores/modules/boarding/packages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data?.packages || [];
    } catch (err) {
      console.error("Failed to fetch boarding packages:", err);
      return [];
    }
  };

  const addBoardingPackage = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/stores/modules/boarding/packages`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Boarding package added successfully!");
        return { success: true, package: res.data.data.package };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add boarding package.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const updateBoardingPackage = async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE}/stores/modules/boarding/packages/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Boarding package updated successfully!");
        return { success: true, package: res.data.data.package };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update boarding package.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const deleteBoardingPackage = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/stores/modules/boarding/packages/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Boarding package deleted successfully!");
        return true;
      }
    } catch (err) {
      showAlert("danger", "Failed to delete boarding package.");
      return false;
    }
  };

  // 6. TRAINING
  const fetchTrainingPrograms = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores/modules/training/programs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data?.programs || [];
    } catch (err) {
      console.error("Failed to fetch training programs:", err);
      return [];
    }
  };

  const addTrainingProgram = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/stores/modules/training/programs`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Training program created successfully!");
        return { success: true, program: res.data.data.program };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add training program.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const updateTrainingProgram = async (id, data) => {
    try {
      const res = await axios.put(`${API_BASE}/stores/modules/training/programs/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Training program updated successfully!");
        return { success: true, program: res.data.data.program };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update training program.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  const deleteTrainingProgram = async (id) => {
    try {
      const res = await axios.delete(`${API_BASE}/stores/modules/training/programs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Training program deleted successfully!");
        return true;
      }
    } catch (err) {
      showAlert("danger", "Failed to delete training program.");
      return false;
    }
  };

  // 7. EMERGENCY
  const fetchEmergencyDetail = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores/modules/emergency`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data?.emergencyDetail || null;
    } catch (err) {
      console.error("Failed to fetch emergency detail:", err);
      return null;
    }
  };

  const saveEmergencyDetail = async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/stores/modules/emergency`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Emergency configuration saved successfully!");
        return { success: true, emergencyDetail: res.data.data.emergencyDetail };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save emergency info.";
      showAlert("danger", msg);
      return { success: false };
    }
  };

  // 8. SUPPORT / FEEDBACK
  const submitSupportFeedback = async (type, message) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/feedback`, { type, message }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        showAlert("success", "Feedback submitted successfully. Our support team will follow up!");
        return true;
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to submit feedback.";
      showAlert("danger", msg);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        token,
        setToken,
        user,
        setUser,
        store,
        setStore,
        bookings,
        setBookings,
        reviews,
        setReviews,
        notifications,
        setNotifications,
        dataLoading,
        setDataLoading,
        alert,
        showAlert,
        handleLogout,
        markNotificationRead,
        markAllNotificationsRead,
        updateBookingStatus,
        updateStore,
        registerStore,
        fetchDashboardData,
        fetchProducts,
        addProduct,
        updateProduct,
        deleteProduct,
        fetchDoctors,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        fetchGroomingPackages,
        addGroomingPackage,
        updateGroomingPackage,
        deleteGroomingPackage,
        fetchWalkers,
        addWalker,
        updateWalker,
        deleteWalker,
        fetchBoardingPackages,
        addBoardingPackage,
        updateBoardingPackage,
        deleteBoardingPackage,
        fetchTrainingPrograms,
        addTrainingProgram,
        updateTrainingProgram,
        deleteTrainingProgram,
        fetchEmergencyDetail,
        saveEmergencyDetail,
        submitSupportFeedback,
        API_BASE
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
