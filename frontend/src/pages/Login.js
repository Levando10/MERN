import React, { useContext, useState } from "react";
import loginIcons from "../assest/signin.gif";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import SummaryApi from "../common";
import Context from "../context";
import SweetAlert from "sweetalert";
import Swal from "sweetalert2";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const { fetchUserDetails, fetchUserAddToCart } = useContext(Context);

  const handleOnChange = (e) => {
    const { name, value } = e.target;

    setData((preve) => {
      return {
        ...preve,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataResponse = await fetch(SummaryApi.signIn.url, {
      method: SummaryApi.signIn.method,
      credentials: "include",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const dataApi = await dataResponse.json();

    if (dataApi.wrongEmail) {
      SweetAlert(
        "Email not found!",
        "Please check your email and try again.",
        "error"
      );
      return;
    }

    if (dataApi.wrongPassword) {
      SweetAlert(
        "Incorrect password!",
        "Please check your password and try again.",
        "error"
      );
      return;
    }

    if (dataApi.notVerified) {
      SweetAlert(
        "Your account is not verified!",
        "Please check your email for the verification link or contact support for assistance.",
        "error"
      );
      return;
    }

    if (dataApi.isBanned) {
      SweetAlert(
        "Your account has been suspended!",
        "Please contact support for further assistance.",
        "error"
      );
      return;
    }

    if (dataApi.success) {
      SweetAlert(
        "Login successful!",
        "Welcome back! You have successfully logged in!",
        "success"
      );
      setTimeout(() => {
        navigate("/");
        fetchUserDetails();
        fetchUserAddToCart();
      }, 400);
    }
  };

  const handleForgotPassword = async () => {
    const { value: email } = await Swal.fire({
      title: "Forgot Password?",
      input: "email",
      inputLabel: "Enter your email to receive reset instructions:",
      inputPlaceholder: "Enter your email",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Submit",
      cancelButtonText: "Cancel",
      allowOutsideClick: false,
      preConfirm: (email) => {
        if (!email) {
          Swal.showValidationMessage("Please enter your email!");
          return false;
        }
        return email;
      },
    });

    if (!email) return;

    try {
      const response = await fetch(SummaryApi.forgotPassword.url, {
        method: SummaryApi.forgotPassword.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire(
          "New Password Sent!",
          "A new password has been sent to your email!",
          "success"
        );
      } else {
        Swal.fire(
          "Password Reset Failed!",
          result.message ||
            "An error occurred while resetting your password. Please try again later.",
          "error"
        );
      }
    } catch (error) {
      Swal.fire("Error!", "Unable to process request at the moment.", "error");
    }
  };

  return (
    <section id="login">
      <div className="mx-auto container p-4">
        <div className="bg-white p-5 w-full max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto">
            <img src={loginIcons} alt="login icons" />
          </div>

          <form className="pt-6 flex flex-col gap-2" onSubmit={handleSubmit}>
            <div className="grid">
              <label>Email : </label>
              <div className="bg-slate-100 p-2">
                <input
                  type="email"
                  placeholder="enter email"
                  name="email"
                  value={data.email}
                  onChange={handleOnChange}
                  className="w-full h-full outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label>Password : </label>
              <div className="bg-slate-100 p-2 flex">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="enter password"
                  value={data.password}
                  name="password"
                  onChange={handleOnChange}
                  className="w-full h-full outline-none bg-transparent"
                />
                <div
                  className="cursor-pointer text-xl"
                  onClick={() => setShowPassword((preve) => !preve)}
                >
                  <span>{showPassword ? <FaEyeSlash /> : <FaEye />}</span>
                </div>
              </div>
              <Link
                onClick={handleForgotPassword}
                className="block w-fit ml-auto hover:underline hover:text-red-600"
              >
                Forgot password ?
              </Link>
            </div>

            <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 w-full max-w-[150px] rounded-full hover:scale-110 transition-all mx-auto block mt-6">
              Login
            </button>
          </form>

          <p className="my-5">
            Don't have account ?{" "}
            <Link
              to={"/sign-up"}
              className=" text-red-600 hover:text-red-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;
