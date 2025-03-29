import React, { useEffect, useState } from "react";
import SummaryApi from "../common";
import moment from "moment";
import { MdModeEdit, MdBlock } from "react-icons/md";
import ChangeUserRole from "../components/ChangeUserRole";
import Swal from "sweetalert2";
import SweetAlert from "sweetalert";

const AllUsers = () => {
  const [allUser, setAllUsers] = useState([]);
  const [openUpdateRole, setOpenUpdateRole] = useState(false);
  const [updateUserDetails, setUpdateUserDetails] = useState({
    email: "",
    name: "",
    role: "",
    _id: "",
  });

  const fetchAllUsers = async () => {
    const fetchData = await fetch(SummaryApi.allUser.url, {
      method: SummaryApi.allUser.method,
      credentials: "include",
    });

    const dataResponse = await fetchData.json();
    if (dataResponse.success) {
      setAllUsers(dataResponse.data);
    }

    if (dataResponse.error) {
      SweetAlert(
        "Failed to load user list!",
        "An error occurred while fetching the user list. Please try again later.",
        "error"
      );
    }
  };

  const handleBanUnBanUser = async (userId, name, isBan) => {
    const action = isBan ? "unban" : "ban";
    const actionText = isBan ? "unlock" : "lock";

    Swal.fire({
      title: `Do you want to ${actionText} ${name} account?`,
      text: `Once ${actionText}ed, this account will ${
        isBan ? "be able to log in again" : "not be able to log in"
      }!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: isBan ? "#28a745" : "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: `Yes, ${actionText} now!`,
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await fetch(SummaryApi.banUser.url, {
            method: SummaryApi.banUser.method,
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              isBanned: !isBan,
            }),
          });

          Swal.fire(
            isBan ? "Unlocked!" : "Locked!",
            `${name}'s account has been ${isBan ? "unlocked" : "locked"}.`,
            "success"
          );
          fetchAllUsers();
        } catch (error) {
          console.error(`Error ${action}ning user:`, error);
          Swal.fire(
            "Error!",
            `Unable to ${actionText} account. Please try again!`,
            "error"
          );
        }
      }
    });
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <div className="bg-white pb-4">
      <table className="w-full userTable">
        <thead>
          <tr className="bg-black text-white">
            <th>Sr.</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Created Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {allUser.map((el, index) => {
            return (
              <tr
                key={el._id}
                className={el.isBanned ? "bg-gray-200 text-red-500" : ""}
              >
                <td>{index + 1}</td>
                <td>
                  {el?.name}{" "}
                  {el.isBanned && (
                    <span className="text-red-500">(Banned)</span>
                  )}
                </td>
                <td>{el?.email}</td>
                <td>{el?.role}</td>
                <td>{moment(el?.createdAt).format("LL")}</td>
                <td>
                  <button
                    className={`p-2 rounded-full cursor-pointer ${
                      el.isBanned
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-100 hover:bg-green-500 hover:text-white"
                    }`}
                    onClick={() => {
                      if (!el.isBanned) {
                        setUpdateUserDetails(el);
                        setOpenUpdateRole(true);
                      }
                    }}
                    disabled={el.isBanned}
                  >
                    <MdModeEdit />
                  </button>
                  <button
                    onClick={() =>
                      handleBanUnBanUser(el?._id, el?.name, el?.isBanned)
                    }
                    className="bg-red-100 p-2 rounded-full cursor-pointer hover:bg-red-500 hover:text-white"
                  >
                    <MdBlock />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {openUpdateRole && (
        <ChangeUserRole
          onClose={() => setOpenUpdateRole(false)}
          name={updateUserDetails.name}
          email={updateUserDetails.email}
          role={updateUserDetails.role}
          userId={updateUserDetails._id}
          callFunc={fetchAllUsers}
        />
      )}
    </div>
  );
};

export default AllUsers;
