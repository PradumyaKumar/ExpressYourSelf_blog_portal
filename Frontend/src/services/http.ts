import axios from "axios";
import Cookies from "js-cookie";

export const user_service =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL || "http://localhost:5000";
export const author_service =
  process.env.NEXT_PUBLIC_AUTHOR_SERVICE_URL || "http://localhost:5001";
export const blog_service =
  process.env.NEXT_PUBLIC_BLOG_SERVICE_URL || "http://localhost:5002";
export const social_service =
  process.env.NEXT_PUBLIC_SOCIAL_SERVICE_URL || "http://localhost:4000";

export const userApi = axios.create({ baseURL: `${user_service}/api/v1` });
export const authorApi = axios.create({ baseURL: `${author_service}/api/v1` });
export const blogApi = axios.create({ baseURL: `${blog_service}/api/v1` });
export const socialApi = axios.create({ baseURL: `${social_service}/api/v1` });

export function authHeaders() {
  const token = Cookies.get("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

