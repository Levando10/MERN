import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FaRegCircleUser } from "react-icons/fa6";
import SummaryApi from "../common";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "../helpers/firebaseConfig";
import ROLE from "../common/role";
import { setUserDetails } from "../store/userSlice";
import SweetAlert from "sweetalert";
const AdminPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.role !== ROLE.ADMIN) {
      navigate("/");
    }
  }, [user]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const storageRef = ref(storage, `avatar/${user._id}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {},
      (error) => {
        console.error("Upload failed:", error);
        setUploading(false);
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          const fetchResponse = await fetch(SummaryApi.updateAvatar.url, {
            method: SummaryApi.updateAvatar.method,
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              userId: user._id,
              profilePic: downloadURL,
            }),
          });
          const responseData = await fetchResponse.json();
          if (responseData.success) {
            dispatch(setUserDetails({ ...user, profilePic: downloadURL }));
            setTimeout(() => {
              SweetAlert(
                "Updating avatar successfully!",
                "Your avatar has been updated.",
                "success"
              );
            }, 200);
          } else {
            console.error("Failed to update avatar:", responseData.message);
          }
        } catch (err) {
          console.error("Error getting download URL:", err);
        }
        setUploading(false);
      }
    );
  };

  return (
    <div className="min-h-[calc(100vh-120px)] md:flex hidden">
      <aside className="bg-white min-h-full w-full max-w-60 customShadow">
        <div className="h-32 flex justify-center items-center flex-col">
          <label className="text-5xl cursor-pointer relative flex justify-center">
            {user?.profilePic ? (
              <img
                src={user?.profilePic}
                className="w-20 h-20 rounded-full"
                alt={user?.name}
              />
            ) : (
              <FaRegCircleUser />
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          <p className="capitalize text-lg font-semibold">{user?.name}</p>
          <p className="text-sm">{user?.role}</p>
        </div>
        <div>
          <nav className="grid p-4">
            <NavLink
              to={"all-users"}
              className={({ isActive }) =>
                `px-2 py-1 hover:bg-slate-100 ${
                  isActive ? "bg-red-100 font-semibold text-red-600" : ""
                }`
              }
            >
              Management Users
            </NavLink>
            <NavLink
              to={"all-orders"}
              className={({ isActive }) =>
                `px-2 py-1 hover:bg-slate-100 ${
                  isActive ? "bg-red-100 font-semibold text-red-600" : ""
                }`
              }
            >
              Management Orders
            </NavLink>
            <NavLink
              to={"all-products"}
              className={({ isActive }) =>
                `px-2 py-1 hover:bg-slate-100 ${
                  isActive ? "bg-red-100 font-semibold text-red-600" : ""
                }`
              }
            >
              Management Product
            </NavLink>
            <NavLink
              to={"all-message"}
              className={({ isActive }) =>
                `px-2 py-1 hover:bg-slate-100 ${
                  isActive ? "bg-red-100 font-semibold text-red-600" : ""
                }`
              }
            >
              Management Message
            </NavLink>
            <NavLink
              to={"revenue-statistics"}
              className={({ isActive }) =>
                `px-2 py-1 hover:bg-slate-100 ${
                  isActive ? "bg-red-100 font-semibold text-red-600" : ""
                }`
              }
            >
              Management Revenue
            </NavLink>
          </nav>
        </div>
      </aside>
      <main className="w-full h-full p-2">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminPanel;
