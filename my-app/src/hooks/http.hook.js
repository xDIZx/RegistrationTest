import { useCallback, useState, useRef } from "react";
import useAuth from "./useAuth.hook";

const BASE_URL = "http://localhost:5000"; // Your backend base URL

export const createUseHttp = () => {
  return () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const auth = useAuth();
    const abortController = useRef(null);

    const request = useCallback(
      async (url, method = "GET", body = null, headers = {}) => {
        setLoading(true);

        abortController.current = new AbortController();

        try {
          if (body && !(body instanceof FormData)) {
            body = JSON.stringify(body);
            headers["Content-Type"] = "application/json";
          }

          if (auth.token) {
            headers["x-access-token"] = auth.token;
          }

          const response = await fetch(`${BASE_URL}${url}`, {
            // Ensure this URL is correct
            method,
            body,
            headers,
            signal: abortController.current.signal,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error");
          }

          const data = await response.json();
          setLoading(false);
          return data;
        } catch (e) {
          if (e.name === "AbortError") {
            console.log("Request aborted");
          } else {
            setLoading(false);
            setError(e.message);
            throw e;
          }
        }
      },
      [auth.token]
    );

    const cancelRequest = () => {
      if (abortController.current) {
        abortController.current.abort();
      }
    };

    const clearError = () => setError(null);

    return {
      loading,
      request,
      error,
      clearError,
      cancelRequest,
    };
  };
};
