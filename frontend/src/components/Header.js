import React, { useContext, useEffect, useState } from "react";
import Logo from "./Logo";
import { GrSearch } from "react-icons/gr";
import { FaRegCircleUser } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common";
import { setUserDetails } from "../store/userSlice";
import ROLE from "../common/role";
import Context from "../context";
import SweetAlert from "sweetalert";
import { Badge, Dropdown } from "antd";
import { BellOutlined } from "@ant-design/icons";

const Header = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState([]);
  const [menuDisplay, setMenuDisplay] = useState(false);
  const context = useContext(Context);
  const navigate = useNavigate();
  const searchInput = useLocation();
  const URLSearch = new URLSearchParams(searchInput?.search);
  const searchQuery = URLSearch.getAll("q");
  const [search, setSearch] = useState(searchQuery);

  const handleLogout = async () => {
    const fetchData = await fetch(SummaryApi.logout_user.url, {
      method: SummaryApi.logout_user.method,
      credentials: "include",
    });

    const data = await fetchData.json();

    if (data.success) {
      SweetAlert(
        "Logged out successfully!",
        "You have been logged out. See you next time!",
        "success"
      );
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
      setTimeout(() => {
        localStorage.clear();
        dispatch(setUserDetails(null));
        navigate("/");
      }, 300);
    }

    if (data.error) {
      SweetAlert("Error logout app!", `${data.message}`, "error");
    }
  };

  const handleSearch = (e) => {
    const { value } = e.target;
    setSearch(value);

    if (value) {
      navigate(`/search?q=${value}`);
    } else {
      navigate("/search");
    }
  };

  useEffect(() => {
    const fetchReviews = async () => {
      const res = await fetch(SummaryApi.reviews.url, {
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) setReviews(data.data);
    };

    if (user && user?.role === "ADMIN") {
      fetchReviews();
    }
  }, [user]);

  return (
    <header className="h-16 shadow-md bg-white fixed w-full z-40">
      <div className=" h-full container mx-auto flex items-center px-4 justify-between">
        <div className="">
          <Link to={"/"}>
            <Logo w={90} h={50} />
          </Link>
        </div>

        {user?.role === "ADMIN" ? (
          ""
        ) : (
          <div className="hidden lg:flex items-center w-full justify-between max-w-sm border rounded-full focus-within:shadow pl-2">
            <input
              type="text"
              placeholder="search product here..."
              className="w-full outline-none"
              onChange={handleSearch}
              value={search}
            />
            <div className="text-lg min-w-[50px] h-8 bg-red-600 flex items-center justify-center rounded-r-full text-white">
              <GrSearch />
            </div>
          </div>
        )}

        <div className="flex items-center gap-7">
          <div
            className="relative flex justify-center"
            onMouseEnter={() => setMenuDisplay(true)}
            onMouseLeave={() => setMenuDisplay(false)}
          >
            {user?._id && (
              <div className="text-3xl cursor-pointer relative flex justify-center">
                {user?.profilePic ? (
                  <img
                    src={user?.profilePic}
                    className="w-8 h-8 rounded-full"
                    alt={user?.name}
                  />
                ) : (
                  <FaRegCircleUser className="w-8 h-8" />
                )}
              </div>
            )}

            {menuDisplay && (
              <div className="min-width-240 absolute bg-white top-8 right-0 w-48 p-3 shadow-lg rounded-lg border border-gray-200 transition-all duration-300">
                <nav className="flex flex-col gap-2">
                  {user?.role === ROLE.ADMIN && (
                    <Link
                      to={"/admin-panel/all-products"}
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      Admin Panel
                    </Link>
                  )}
                </nav>
                <nav className="flex flex-col gap-2">
                  {user?.role === ROLE.ADMIN && (
                    <Link
                      to={"/admin-panel/all-users"}
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      Management Users
                    </Link>
                  )}
                </nav>
                <nav className="flex flex-col gap-2">
                  {user?.role === ROLE.ADMIN && (
                    <Link
                      to={"/admin-panel/all-orders"}
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      Management Order
                    </Link>
                  )}
                </nav>
                <nav className="flex flex-col gap-2">
                  {user?.role === ROLE.ADMIN && (
                    <Link
                      to={"/admin-panel/revenue-statistics"}
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      Management Revenue
                    </Link>
                  )}
                </nav>
                <nav className="flex flex-col gap-2">
                  {user?.role && (
                    <Link
                      to="/profile?tab=account"
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      Profile
                    </Link>
                  )}
                </nav>
                <nav className="flex flex-col gap-2">
                  {user?.role === ROLE.GENERAL && (
                    <Link
                      to="/profile?tab=orders"
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      History payment
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>

          {user?._id && user?.role === ROLE.ADMIN && (
            <Dropdown
              overlay={
                <div className="bg-white shadow-lg rounded-md max-h-96 overflow-y-auto w-80 p-3">
                  {reviews.length === 0 ? (
                    <div className="text-center text-gray-400">No reviews</div>
                  ) : (
                    reviews.map((item) => (
                      <div
                        key={item._id}
                        onClick={() => {
                          if (item.productId) {
                            navigate(`/product/${item.productId}`);
                          }
                        }}
                        className={`flex gap-3 items-start p-2 rounded-md mb-2 ${
                          item.isAdminReplied ? "text-gray-400" : "text-black"
                        }`}
                      >
                        {item.userId?.profilePic ? (
                          <img
                            src={item.userId.profilePic}
                            alt="avatar"
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <FaRegCircleUser className="w-8 h-8" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {item.userId?.name || "Unknown"} — Rating:{" "}
                            {item.rating}
                          </p>
                          <p className="text-sm line-clamp-2">{item.review}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              }
              trigger={["hover"]}
              placement="bottomRight"
            >
              <Badge count={reviews.filter((r) => !r.isAdminReplied).length}>
                <BellOutlined className="text-2xl cursor-pointer ml-4" />
              </Badge>
            </Dropdown>
          )}

          {user?._id && user?.role === ROLE.GENERAL && (
            <Link to={"/cart"} className="text-2xl relative">
              <span>
                <FaShoppingCart />
              </span>

              <div className="bg-red-600 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3">
                <p className="text-sm">{context?.cartProductCount}</p>
              </div>
            </Link>
          )}

          <div>
            {user?._id ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </button>
            ) : (
              <Link
                to={"/login"}
                className="px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
