import { blogApi } from "./http";
import type { Blog, SingleBlogResponse } from "./types";

export async function getBlogs(searchQuery = "", category = "") {
  const { data } = await blogApi.get<Blog[]>("/blogs/all", {
    params: { searchQuery, category },
  });

  return data;
}

export async function getSingleBlog(id: string | string[]) {
  const { data } = await blogApi.get<SingleBlogResponse>(`/blogs/${id}`);

  return data;
}
