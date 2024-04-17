import React, { useState } from "react";
import { supabase } from '../utils/supabaseClient';
import { FaUser, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { AiOutlineEyeInvisible } from "react-icons/ai";
import { IoEyeOutline } from "react-icons/io5";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Login({ handleLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true); // Set loading to true on form submission

    try {
      // Pang tawag acc galing env
      const adminUsername = process.env.REACT_APP_ADMIN_USERNAME;
      const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD;
      const superadminUsername = process.env.REACT_APP_SUPERADMIN_USERNAME;
      const superadminPassword = process.env.REACT_APP_SUPERADMIN_PASSWORD;

      if (username === adminUsername && password === adminPassword) {
        handleLogin("admin");
        navigate("/home-admin");
        return;
      }

      if (username === superadminUsername && password === superadminPassword) {
        handleLogin("super-admin");
        navigate("/home-super-admin");
        return;
      }

      // Pang authenticate ng users acc galing database
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('student_number', username);

      if (error) {
        throw new Error("Invalid username or password");
      }

      // Authenticate ng stud no. saka password
      if (data.length === 1 && data[0].password === password) {
        // Pang bato ng role na user saka mga info ng nakalogin
        handleLogin("user", data[0].first_name, data[0].last_name, data[0].middle_name, data[0].email, data[0].course, data[0].password, data[0].student_number);
        navigate("/home-user");
      } else {
        throw new Error("Invalid username or password");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message, {
        autoClose: 2000,
        hideProgressBar: true
      });
    } finally {
      setLoading(false); // Set loading to false regardless of success or error
    }
  };

  return (
    <div className="flex items-center justify-start min-h-screen">
      <div className="flex items-center justify-center w-1/2 min-h-screen text-center bg-black text-white p-8 rounded-br-md rounded-tr-md shadow-lg">
        <h1 className="text-80xl font-bold">
          St. Clare College
          <p className="text-80xl"> of Caloocan</p>
          <p className="text-80xl text-white"> Library Management System</p>
        </h1>
      </div>

      <div className="flex items-center justify-center w-1/2">
        <div
          className="bg-white p-8 rounded-md shadow w-80"
          style={{ height: "90vh", width: "75vh" }}
        >
          {/* Conditionally render loader */}
          {loading && (
            <div className="loader-wrapper">
              <div className="loader"></div>
            </div>
          )}

          <div className="bg-white p-2 rounded-md">
            <h2 className="text-4xl font-bold mb-4 text-center mt-10">
              Sign in to your account
            </h2>

            <h2 className="text-base font-semibold mb-4 text-center text-blue">
              Welcome Back! Please enter your details.
            </h2>
          </div>

          <form className="space-y-12 p-6" onSubmit={handleSubmit}>
            {/* Username input */}
            <div className="relative">
              <label
                htmlFor="username"
                className="block text-base font-medium text-black mb-2 mt-10 ring-black"
              >
                Username:
              </label>

              <div className="flex items-center">
                <FaUser className="h-5 w-5 text-black absolute left-2" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 pl-8 p-4 w-full rounded-xl bg-gray shadow-sm ring-black"
                  placeholder="Student No./Email"
                  required
                />
              </div>
            </div>

            {/* Password input */}
            <div className="relative mt-4">
              <label
                htmlFor="password"
                className="block text-base font-medium text-black mb-2 mt-10"
              >
                Password:
              </label>

              <div className="flex items-center">
                <FaLock className="h-5 w-5 text-black absolute left-2" />

                <input
                  type={visible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 pl-8 p-4 w-full rounded-xl bg-gray shadow-sm"
                  placeholder="Enter Password"
                  required
                />
                <div className="absolute right-0 top-0 mt-14 mr-4 text-xl text-blue" onClick={() => setVisible(!visible)}>
                  {
                    visible ? <IoEyeOutline /> : <AiOutlineEyeInvisible />
                  }
                </div>
              </div>
            </div>

            {/* Login Button */}
            <div className="bg-blue p-2 rounded-md mt-16">
              <button
                type="submit"
                className="w-full p-2 text-xl font-bold text-white rounded-md "
                disabled={loading} // Disable button when loading
              >
                Log In
              </button>
            </div>

            {/* Don't have an account */}
            <div className="text-base text-black text-center mt-16">
              Don't have an account?
              <p className="text-base text-blue mt-2 cursor-default">
                Go to library
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
