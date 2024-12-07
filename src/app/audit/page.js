"use client";
import React, { useState, useEffect } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AuditTrail() {
  const [data, setData] = useState(null);
  const [sharedData, setSharedData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadData, setLoadData] = useState(false);
  const [dataDropdown, setDataDropdown] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedValue, setSelectedValue] = useState("");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState("Select User");
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [userName, setUserName] = useState("");

  const isWithinRange = (inputDate, startDate, endDate) => {
    const date = new Date(inputDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  };

  const isUploadedBy = (userName) => {
    let returnValue = false;
    if (selectedMember == "Select User") {
      returnValue = true;
    } else if (userName == selectedMember) {
      returnValue = true;
    }

    return returnValue;
  };

  // Helper function to format file size
  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} bytes`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(2)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(2)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
  };

  // Convert `lastModified` from epoch to readable date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A"; // Handle undefined timestamps
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  useEffect(() => {
    // Fetch initial dropdown data
    const fetchData = async () => {
      try {
        const storedName = localStorage.getItem("UserName");
        //console.log("storedName"+storedName);
        setUserName(storedName);

        const responseClient = await fetch(`/api/getSharePointClientName`);
        if (!responseClient.ok) throw new Error(await responseClient.text());
        const dataClient = await responseClient.json();

        console.log(dataClient.value);

        const response = await fetch("/api/client");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const result = await response.json();

        // setDataDropdown(
        //   result.map((item) => ({ value: item.id, label: item.friendlyName }))
        // );

        const dropdownData = [];
        result.forEach((item) => {
          //console.log("userName"+storedName+"item.friendlyName"+item.friendlyName);

          const filteredItems = dataClient.value.filter(
            (itemClient) =>
              itemClient.fields?.TaxAssessorName === storedName &&
              itemClient.fields?.ClientName === item.friendlyName
          );

          if (filteredItems.length == 1) {
            dropdownData.push({ value: item.id, label: item.friendlyName });
          }
        });

        setDataDropdown(dropdownData);

        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChangeUser = (event) => {
    setSelectedMember(event.target.value);
  };

  const handleDownload = async (event) => {
    event.preventDefault();
    //console.log("selectedValue"+selectedValue);
    //console.log("selectedID"+event.target.id);

    try {
      const response = await fetch(
        `/api/fileDownload?groupID=${selectedValue}&fileID=${event.target.id}`
      );
      if (!response.ok) {
        throw new Error("Failed to download the file");
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;

      // Extract filename from Content-Disposition header if available
      const contentDisposition = response.headers.get("Content-Disposition");
      const fileName = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "downloaded_file";

      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.message);
      console.error("Error downloading file:", err);
    } finally {
    }
  };

  const handleChange = async (event) => {
    const selectedGroupId = event.target.value;
    setSelectedValue(selectedGroupId);
    setSelectedMember("Select User"); // Reset member dropdown
    setSharedData([]); // Clear shared folder data
    setMembers([]); // Clear members list
    setLoading(true);

    try {
      // Fetch members for the selected group
      const membersResponse = await fetch(
        `/api/users?groupId=${selectedGroupId}`
      );
      if (!membersResponse.ok) {
        throw new Error(
          `Failed to fetch members: ${membersResponse.statusText}`
        );
      }
      const membersResult = await membersResponse.json();
      const extractedMembers = membersResult.memberDetails.map((member) => ({
        id: member.user.id,
        name: member.user.name,
      }));
      setMembers(extractedMembers);
      setLoadData(false);

      //console.log("loadData:" + loadData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // if (!selectedValue) {
    //   setError('Please select a value from the clients dropdown.');
    //   return;
    // }

    try {
      // Fetch shared folder data for the selected group
      const sharedDataResponse = await fetch(
        `/api/getSharedFolder?groupId=${selectedValue}`
      );
      if (sharedDataResponse.ok) {
        const sharedDataResult = await sharedDataResponse.json();
        console.log(sharedDataResult);
        setSharedData(sharedDataResult);
        setLoadData(true);
      }
    } catch (err) {
      setError(err.message);
      console.log(err.message);
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen ">
      {/* Header */}
      <header className="flex items-center justify-between bg-white-100 py-4 px-6 border-b ">
        <div className="shrink-0 ">
          <img className="w-{20},h-{10} " src="logo.jpg" alt="Your Company" />
        </div>
        <div className="flex items-center space-x-2">
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="2"
              d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"
            />
          </svg>

          <input type="text" placeholder="Search" className="border:none" />
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            {/* Placeholder for user icon */}
            <span className="text-sm font-bold">SK</span>
          </div>
        </div>
      </header>
      {/* Main content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className=" bg-gray-200 border-r w-64  ">
          <ul className="space-y-4 py-6 px-4 ">
            <li className="flex items-center space-x-2 ">
              <span>
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0V12a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V5.25"
                  />
                </svg>
              </span>
              <span>Dashboard</span>
            </li>
            <li className="flex items-center space-x-2 	">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </span>
              <span>Clients</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                  />
                </svg>
              </span>
              <span>Members</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                  />
                </svg>
              </span>
              <span>Activity</span>
            </li>
            <li className="flex items-center space-x-2 text-sm">
              <span>Tools</span>
            </li>
            <li className="flex items-center space-x-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </span>
              <span>Tasks</span>
            </li>
            <li className="flex items-center space-x-2 text-sm">
              <span>Communication </span>
            </li>
            <li className="flex items-center space-x-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 0 8.835-2.535m0 0A23.74 23.74 0 0 0 18.795 3m.38 1.125a23.91 23.91 0 0 1 1.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 0 0 1.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 0 1 0 3.46"
                  />
                </svg>
              </span>
              <span>Reachouts</span>
            </li>
            <li className="flex items-center space-x-2 text-sm">
              <span>Intelligence </span>
            </li>
            <li className="flex items-center space-x-2">
              <span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6"
                  />
                </svg>
              </span>
              <span>Audit Trail</span>
            </li>
          </ul>
        </aside>

        {/* Main Section */}
        <main className="flex-1 p-6">
          <h2 className="text-lg font-semibold mb-4">Audit Trail</h2>
          <div className="bg-white p-6 rounded-md shadow-md space-y-4">
            {/* Date Range */}
            <div>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-bold pr-2">
                    StartDate :
                  </label>
                  <div className="w-72 border px-3 text-xs py-1 mt-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300">
                    <ReactDatePicker
                      selected={selectedStartDate}
                      onChange={(date) => setSelectedStartDate(date)}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <label className="block text-sm font-bold">EndDate : </label>
                  {/* <div className="border border-black p-2.5 rounded-md"> */}
                  <div className="w-72 border px-3 py-1 text-xs mt-2 rounded-md focus:outline-none focus:ring focus:ring-blue-300">
                    <ReactDatePicker
                      selected={selectedEndDate}
                      onChange={(date) => setSelectedEndDate(date)}
                      dateFormat="yyyy-MM-dd"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-4 mt-2">
                <label className="block text-sm font-bold">Clients :</label>{" "}
                &nbsp; &nbsp;&nbsp;
                <select
                  id="dropdown"
                  value={selectedValue}
                  onChange={handleChange}
                  className="w-72 border px-3 py-1 mt-2 rounded-md text-xs focus:outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="">Select Client</option>
                  {dataDropdown.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center space-x-4 mt-2">
                <label className="block text-sm font-bold pr-2">Users :</label>
                <select
                  id="dropdown"
                  value={selectedMember}
                  onChange={handleChangeUser}
                  className="w-72 border px-3 py-1 text-xs  mt-2  rounded-md focus:outline-none focus:ring focus:ring-blue-300"
                >
                  <option value="">Select User</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.name}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-4 mt-2">
              {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
            <div className="flex items-center space-x-4 mt-2 ml-20">
              {" "}
              &nbsp;&nbsp;&nbsp;
              <button
                type="submit"
                onClick={handleSubmit}
                className="flex w-half  justify-center rounded-md bg-pink-900	 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-700"
              >
                Show result
              </button>
              <button
                type="submit"
                className="flex w-half  justify-center rounded-md bg-pink-900	 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-pink-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-700"
              >
                Reset
              </button>
            </div>
          </div>
          <br />
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    File Name
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Size (Bytes)
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Uploaded By
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Last Modified
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Download
                  </th>
                </tr>
              </thead>

              <tbody>
                {sharedData?.items?.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor: item.id % 2 === 0 ? "#fff" : "#f6f6f6",
                      border: "1px solid #ddd",
                      //display:isWithinRange(item.lastModified,selectedStartDate,selectedEndDate)==true?"table-row":"none" || isUploadedBy(item.uploaded?.name) == true? "table-row": "none",
                      //display:isWithinRange(item.lastModified,selectedStartDate,selectedEndDate)==true?"table-row":"none",
                      //display:isUploadedBy(item.uploaded?.name) == true? "table-row": "none",
                    }}
                  >
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {item.friendlyName || "N/A"}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {formatSize(item.size) || "N/A"}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {item.uploaded?.name || "Unknown"}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {formatDate(item.lastModified)}
                    </td>
                    <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                      {/* <a onClick={handleDownload} id={item.id}>
                        Download
                      </a> */}
                      <a
                        onClick={handleDownload}
                        id={item.id}
                        style={{
                          color: "blue", // Link color
                          textDecoration: "underline", // Underline to mimic traditional links
                          cursor: "pointer", // Hand icon for click
                        }}
                        onMouseOver={(e) => {
                          e.target.style.color = "darkblue"; // Change color on hover
                        }}
                        onMouseOut={(e) => {
                          e.target.style.color = "blue"; // Reset color when not hovered
                        }}
                      >
                        Download File
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>

              {/* <tbody>
                <tr className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700">
                  <td className="px-6 py-4">Silver</td>
                  <td className="px-6 py-4">Silver</td>
                  <td className="px-6 py-4">Laptop</td>
                  <td className="px-6 py-4">$2999</td>
                </tr>

              </tbody> */}
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
