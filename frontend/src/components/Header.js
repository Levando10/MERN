import React, { useContext, useState } from "react";
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

const Header = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
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
      setTimeout(() => {
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
  return (
    <header className="h-16 shadow-md bg-white fixed w-full z-40">
      <div className=" h-full container mx-auto flex items-center px-4 justify-between">
        <div className="">
          <Link to={"/"}>
            <Logo w={90} h={50} />
          </Link>
        </div>

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
              <div className="absolute bg-white top-8 right-0 w-48 p-3 shadow-lg rounded-lg border border-gray-200 transition-all duration-300">
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
                  {user?.role && (
                    <Link
                      to={"/profile"}
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      Profile
                    </Link>
                  )}
                </nav>
                <nav className="flex flex-col gap-2">
                  {user?.role === ROLE.GENERAL && (
                    <Link
                      to={"/admin-panel/all-products"}
                      className="block px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition"
                    >
                      History payment
                    </Link>
                  )}
                </nav>
              </div>
            )}
          </div>

          {user?._id && (
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
