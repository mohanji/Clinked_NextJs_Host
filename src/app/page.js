"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("nattuthurai.k@live.com");
  const [password, setPassword] = useState("Welcome123");
  const [error, setError] = useState("");



  // useEffect(() => {



  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`/api/getSharePointList`);
      if (!response.ok) throw new Error(await response.text());
      const data = await response.json();

      //console.log(data.value);

      const filteredItems = data.value.filter(
        (item) =>
          item.fields?.Email === email && item.fields?.Password === password
      );

      if (filteredItems.length == 1) {
        console.log("UserName:"+filteredItems[0].fields?.UserName);
        localStorage.setItem('UserName', filteredItems[0].fields?.UserName);
        router.push("/audit");
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError(err.message);
    }

    // Placeholder authentication logic
    // if (email === "test@example.com" && password === "password123") {
    //   router.push("/audit"); // Redirect on successful login
    // } else {
    //   setError("Invalid email or password. Please try again.");
    // }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      
      {/* Logo Section */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          className="mx-auto h-12 w-auto"
          src="logo.jpg" // Replace with your logo's path or URL
          alt="Your Company"
        />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Executive Financial Management
        </h2>
        <h4 className="mt-6 text-center text-xl tracking-tight text-gray-900">
          Enter your credentials to continue
        </h4>
      </div>

      {/* Login Form */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-900"
            >
              Email address
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-900 placeholder-gray-400 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-900"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-1.5 text-gray-900 placeholder-gray-400 focus:ring-indigo-600 focus:border-indigo-600 sm:text-sm"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
            >
              Sign in
            </button>
          </div>
        </form>
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-6">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm text-gray-700 hover:bg-gray-50">
            <img src="google.png" alt="Google" className="h-5 w-5 mr-2" />
            Google
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm text-gray-700 hover:bg-gray-50">
            <img src="linkedin.png" alt="LinkedIn" className="h-5 w-5 mr-2" />
            LinkedIn
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm text-gray-700 hover:bg-gray-50">
            <img src="microsoft.png" alt="Microsoft" className="h-5 w-5 mr-2" />
            Microsoft
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm text-gray-700 hover:bg-gray-50">
            <img src="apple.png" alt="Apple" className="h-5 w-5 mr-2" />
            Apple
          </button>
        </div>
      </div>
    </div>
  );
}
