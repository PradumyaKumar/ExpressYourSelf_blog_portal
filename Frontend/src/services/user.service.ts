import { userApi, authHeaders } from "./http";
import type { User } from "./types";

export async function loginUser(code: string | undefined) {
  const { data } = await userApi.post<{
    message: string;
    token: string;
    user: User;
  }>("/login", { code });

  return data;
}

export async function getMyProfile() {
  const { data } = await userApi.get<User>("/me", {
    headers: authHeaders(),
  });

  return data;
}

export async function getUserProfile(id: string) {
  const { data } = await userApi.get<User>(`/user/${id}`);

  return data;
}

export async function updateUserProfile(payload: Partial<User>) {
  const { data } = await userApi.post<{
    message: string;
    token: string;
    user: User;
  }>("/user/update", payload, {
    headers: authHeaders(),
  });

  return data;
}

export async function updateUserProfilePic(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await userApi.post<{
    message: string;
    token: string;
    user: User;
  }>("/user/upodatePic", formData, {
    headers: authHeaders(),
  });

  return data;
}

