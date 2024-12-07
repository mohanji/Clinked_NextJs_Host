import axios from "axios";

import { API_KEY } from "./constants";
import {
  formPostApiCall,
  getApiCall,
  getApiClientCall,
  postApiCall,
} from "./operations";

export const header = (
  authToken = null,
  appendFormheader = false,
  clientCall
) => {
  const token = clientCall ? "" : authToken;

  const common = {
    "X-Requested-With": "XMLHttpRequest",
    "Content-Type": appendFormheader
      ? "multipart/form-data"
      : "application/json",
  };

  return { headers: token ? { ...common, token } : common };
};

const AJAX = {
  post: async (url, data, formData = null, opts = {}) => {
    if (formData) {
      const baseHeaders = header(opts?.token);
      const formDataHeader = {
        headers: {
          ...baseHeaders.headers,
          "Content-Type": "multipart/form-data",
          cookies: document.cookie,
          key: API_KEY,
        },
      };
      return axios.post(url, formData, formDataHeader);
    } else {
      return postApiCall(url, JSON.stringify(data), header(opts?.token));
    }
  },
  serverpost: async (url, data) => {
    return postApiCall(url, data);
  },
  get: async (url, opts = {}, customHeader = null) => {
    return getApiCall(url, customHeader ?? header(opts?.token), opts);
  },
  getWithOutHeader: async (url) => axios.get(url),
  formPost: async (url, formData, opts = {}) => {
    const baseHeaders = header();
    const formDataHeader = {
      headers: {
        ...baseHeaders.headers,
        "Content-Type": "multipart/form-data",
      },
    };
    return formPostApiCall(url, formData, formDataHeader);
  },
  getWithClient: async (url, opts = {}) => {
    const clientCall = true;
    return getApiClientCall(url, header(opts?.token, "", clientCall), opts);
  },
};

export default AJAX;
