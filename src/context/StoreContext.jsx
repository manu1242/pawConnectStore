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
    }
  }, [token]);

  const fetchDashboardData = async () => {
    setDataLoading(true);
    try {
      // 1. Fetch profile
      const profileRes = await axios.get(`${API_BASE}/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (profileRes.data.success && profileRes.data.data?.user) {
        const currentUser = profileRes.data.data.user;
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
      try {
        const storeRes = await axios.get(`${API_BASE}/stores`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (storeRes.data.success && storeRes.data.data?.store) {
          setStore(storeRes.data.data.store);
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
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
  };

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

  const updateStore = async (storeData) => {
    try {
      // Merge existing store details to avoid backend validation/override bugs
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
        dataLoading,
        setDataLoading,
        alert,
        showAlert,
        handleLogout,
        updateBookingStatus,
        updateStore,
        registerStore,
        fetchDashboardData,
        API_BASE
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
