import { authorApi, authHeaders } from "./http";
import type { Blog } from "./types";

export interface BlogFormPayload {
  title: string;
  description: string;
  category: string;
  blogcontent: string;
  image: File | null;
}

function toBlogFormData(payload: BlogFormPayload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);
  formData.append("blogcontent", payload.blogcontent);
  formData.append("category", payload.category);

  if (payload.image) {
    formData.append("file", payload.image);
  }

  return formData;
}

export async function createBlog(payload: BlogFormPayload) {
  const { data } = await authorApi.post<{ message: string; blog: Blog }>(
    "/blog/new",
    toBlogFormData(payload),
    { headers: authHeaders() }
  );

  return data;
}

export async function updateBlog(id: string | string[], payload: BlogFormPayload) {
  const { data } = await authorApi.post<{ message: string; blog: Blog }>(
    `/blog/${id}`,
    toBlogFormData(payload),
    { headers: authHeaders() }
  );

  return data;
}

export async function deleteBlog(id: string | string[]) {
  const { data } = await authorApi.delete<{ message: string }>(`/blog/${id}`, {
    headers: authHeaders(),
  });

  return data;
}

export async function generateTitle(text: string) {
  const { data } = await authorApi.post<string>("/ai/title", { text });

  return data;
}

export async function generateDescription(title: string, description: string) {
  const { data } = await authorApi.post<string>("/ai/descripiton", {
    title,
    description,
  });

  return data;
}

export async function generateBlogContent(blog: string) {
  const { data } = await authorApi.post<{ html: string }>("/ai/blog", {
    blog,
  });

  return data;
}

