import "./App.css";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import SummaryApi from "./common";
import Context from "./context";
import { useDispatch } from "react-redux";
import { setUserDetails } from "./store/userSlice";
import Chat from "./components/Chat/Chat";

function App() {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);
  const [cartProductCount, setCartProductCount] = useState(0);

  const fetchUserDetails = async () => {
    const dataResponse = await fetch(SummaryApi.current_user.url, {
      method: SummaryApi.current_user.method,
      credentials: "include",
    });

    const dataApi = await dataResponse.json();

    if (dataApi.success) {
      dispatch(setUserDetails(dataApi.data));
    }
  };

  const fetchUserAddToCart = async () => {
    const dataResponse = await fetch(SummaryApi.addToCartProductCount.url, {
      method: SummaryApi.addToCartProductCount.method,
      credentials: "include",
    });

    const dataApi = await dataResponse.json();

    setCartProductCount(dataApi?.data?.count);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    // const newSocket = io("http://localhost:8080", {
    const newSocket = io("https://mern-v6c4.onrender.com", {
      auth: { token },
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket server!");
    });

    setSocket(newSocket);

    // Cleanup khi component unmount
    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchUserDetails();
    fetchUserAddToCart();
  }, []);
  return (
    <>
      <Context.Provider
        value={{
          socket,
          fetchUserDetails,
          cartProductCount,
          fetchUserAddToCart,
        }}
      >
        <ToastContainer position="top-center" />

        <Header />
        <main className="min-h-[calc(100vh-120px)] pt-16">
          <Outlet />
        </main>
        <Footer />
        <Chat />
      </Context.Provider>
    </>
  );
}

export default App;
