import axios from "axios";
import AJAX from "../ajax";

//removing the domain and slicing the url
const removeUrl = (url) => {
  const parts = url.split(".com");
  if (parts.length > 1) {
    const remainingUrl = parts[1].slice(1);
    return remainingUrl;
  }
};

const postApiCall = async (url, payload, header = {}) => {
  const { headers } = header;
  const apiName = removeUrl(url);
  try {
    const response = await axios({
      url: `/api/post/${apiName}`,
      method: "POST",
      data: { payload },
      headers: {
        ...headers,
        withCredentials: true,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

const getApiCall = async (url, header = {}, config = {}) => {
  const { headers } = header;
  const apiName = removeUrl(url);
  try {
    const response = await axios({
      url: `/api/get/${apiName}`,
      method: "GET",
      headers: {
        ...headers,
        withCredentials: true,
        apiConfig: JSON.stringify(config),
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

const formPostApiCall = async (url, payload, header = {}) => {
  const { headers } = header;
  const apiName = removeUrl(url);
  try {
    const response = await axios({
      url: `/api/formPost/${apiName}`,
      method: "POST",
      data: payload,
      headers: {
        ...headers,
        withCredentials: true,
      },
    });
    return response;
  } catch (err) {
    throw err;
  }
};

const getApiClientCall = async (url, header = {}, config = {}) => {
  const { headers } = header;
  try {
    const response = await axios({
      url,
      method: "GET",
      headers: {
        ...headers,
        withCredentials: true,
        apiConfig: JSON.stringify(config),
      },
    });
    return response?.data;
  } catch (err) {
    throw err;
  }
};

const fetchAllData = async (apiUrls) => {
  try {
    // Use Promise.all to make multiple API calls concurrently
    const responses = await Promise.all(
      apiUrls.map((item) => AJAX.getWithClient(item.url))
    );
    // If you want to store responses in a single variable based on apiUrls key
    const combinedData = responses.reduce((acc, data, index) => {
      acc[apiUrls[index].name] = data.data;
      return acc;
    }, {});

    // Return the combined data or use it as needed
    return combinedData;
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export {
  fetchAllData,
  formPostApiCall,
  getApiCall,
  getApiClientCall,
  postApiCall,
};
