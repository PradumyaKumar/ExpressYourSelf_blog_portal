import { socialApi, authHeaders } from "./http";
import type { Blog, Comment } from "./types";

export async function incrementBlogView(id: string | string[]) {
  const { data } = await socialApi.post<{ viewCount: number }>(
    `/blogs/${id}/view`
  );

  return data;
}

export async function getLikeStatus(id: string | string[]) {
  const { data } = await socialApi.get<{ liked: boolean; likeCount: number }>(
    `/blogs/${id}/likes`,
    { headers: authHeaders() }
  );

  return data;
}

export async function toggleLike(id: string | string[]) {
  const { data } = await socialApi.post<{ liked: boolean; likeCount: number }>(
    `/blogs/${id}/like`,
    {},
    { headers: authHeaders() }
  );

  return data;
}

export async function getBookmarks() {
  const { data } = await socialApi.get<Blog[]>("/blogs/bookmarks/all", {
    headers: authHeaders(),
  });

  return data;
}

export async function getBookmarkStatus(id: string | string[]) {
  const { data } = await socialApi.get<{ bookmarked: boolean }>(
    `/blogs/${id}/bookmark/status`,
    { headers: authHeaders() }
  );

  return data;
}

export async function toggleBookmark(id: string | string[]) {
  const { data } = await socialApi.post<{ bookmarked: boolean }>(
    `/blogs/${id}/bookmark`,
    {},
    { headers: authHeaders() }
  );

  return data;
}

export async function getComments(blogId: string | string[]) {
  const { data } = await socialApi.get<Comment[]>(`/comments/${blogId}`);

  return data;
}

export async function addComment(blogId: string | string[], comment: string) {
  const { data } = await socialApi.post<{ message: string; comment: Comment }>(
    `/comments/${blogId}`,
    { comment },
    { headers: authHeaders() }
  );

  return data;
}

export async function deleteComment(commentId: string) {
  const { data } = await socialApi.delete<{ message: string }>(
    `/comments/${commentId}`,
    {
      headers: authHeaders(),
    }
  );

  return data;
}
