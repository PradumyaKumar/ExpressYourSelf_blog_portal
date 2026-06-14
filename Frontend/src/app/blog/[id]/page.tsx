"use client";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData } from "@/context/AppContext";
import type { Blog, User } from "@/context/AppContext";
import {
  Bookmark,
  BookmarkCheck,
  Edit,
  Trash2,
  Trash2Icon,
  User2,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { authorService, blogService, socialService } from "@/services";
import type { Comment } from "@/services/types";

const BlogPage = () => {
  const { isAuth, user, fetchBlogs, savedBlogs, getSavedBlogs } = useAppData();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  const [comments, setComments] = useState<Comment[]>([]);

  async function fetchComment() {
    try {
      setLoading(true);
      const data = await socialService.getComments(id);
      setComments(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchComment();
  }, [id]);

  const [comment, setComment] = useState("");

  async function addComment() {
    try {
      setLoading(true);
      const data = await socialService.addComment(id, comment);
      toast.success(data.message);
      setComment("");
      fetchComment();
    } catch (error) {
      toast.error("Problem while adding comment");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSingleBlog() {
    try {
      setLoading(true);
      const data = await blogService.getSingleBlog(id);
      setBlog(data.blog);
      setAuthor(data.author);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  const deleteComment = async (id: string) => {
    if (confirm("Are you sure you want to delete this comment")) {
      try {
        setLoading(true);
        const data = await socialService.deleteComment(id);
        toast.success(data.message);
        fetchComment();
      } catch (error) {
        toast.error("Problem while deleting comment");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  async function deletBlog() {
    if (confirm("Are you sure you want to delete this blog")) {
      try {
        setLoading(true);
        const data = await authorService.deleteBlog(id);
        toast.success(data.message);
        router.push("/blogs");
        setTimeout(() => {
          fetchBlogs();
        }, 4000);
      } catch (error) {
        toast.error("Problem while deleting comment");
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  }

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (savedBlogs && savedBlogs.some((b) => b.id.toString() === id)) {
      setSaved(true);
    } else {
      setSaved(false);
    }
  }, [savedBlogs, id]);

  async function saveBlog() {
    try {
      setLoading(true);
      const data = await socialService.toggleBookmark(id);
      toast.success(data.bookmarked ? "Blog saved" : "Blog removed");
      setSaved(data.bookmarked);
      getSavedBlogs();
    } catch (error) {
      toast.error("Problem while saving blog");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSingleBlog();
    socialService.incrementBlogView(id).catch(console.log);
  }, [id]);

  if (!blog) {
    return <Loading />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <h1 className="text-4xl font-bold text-foreground">{blog.title}</h1>
          <p className="mt-4 flex flex-wrap items-center gap-3 text-muted-foreground">
            <Link
              className="flex items-center gap-2 hover:text-primary"
              href={`/profile/${author?._id}`}
            >
              <img
                src={author?.image}
                className="h-9 w-9 rounded-full border border-primary/50 object-cover"
                alt=""
              />
              {author?.name}
            </Link>
            {isAuth && (
              <Button
                variant={"ghost"}
                className="mx-3"
                size={"lg"}
                disabled={loading}
                onClick={saveBlog}
              >
                {saved ? <BookmarkCheck /> : <Bookmark />}
              </Button>
            )}
            {blog.author === user?._id && (
              <>
                <Button
                  size={"sm"}
                  onClick={() => router.push(`/blog/edit/${id}`)}
                >
                  <Edit />
                </Button>
                <Button
                  variant={"destructive"}
                  className="mx-2"
                  size={"sm"}
                  onClick={deletBlog}
                  disabled={loading}
                >
                  <Trash2Icon />
                </Button>
              </>
            )}
          </p>
        </CardHeader>
        <CardContent>
          <img
            src={blog.image}
            alt=""
            className="mb-6 h-80 w-full rounded-lg object-cover"
          />
          <p className="mb-6 border-l-2 border-primary pl-4 text-lg text-muted-foreground">
            {blog.description}
          </p>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.blogcontent }}
          />
        </CardContent>
      </Card>

      {isAuth && (
        <Card>
          <CardHeader>
            <h3 className="text-xl font-semibold">Leave a comment</h3>
          </CardHeader>
          <CardContent>
            <Label htmlFor="comment">Your Comment</Label>
            <Input
              id="comment"
              placeholder="Type your comment here"
              className="my-2"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={addComment} disabled={loading}>
              {loading ? "Adding comment..." : "Post Comment"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium">All Comments</h3>
        </CardHeader>
        <CardContent>
          {comments && comments.length > 0 ? (
            comments.map((e, i) => {
              return (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3 border-b border-border py-4 last:border-b-0"
                >
                  <div>
                    <p className="font-semibold flex items-center gap-1">
                      <span className="user rounded-full border border-border bg-muted p-1">
                        <User2 />
                      </span>
                      {e.username}
                    </p>
                    <p className="mt-1 text-muted-foreground">{e.comment}</p>
                    <p className="mt-1 text-xs text-muted-foreground/80">
                      {new Date(e.create_at).toLocaleString()}
                    </p>
                  </div>
                  {e.userid === user?._id && (
                    <Button
                      onClick={() => deleteComment(e.id)}
                      variant={"destructive"}
                      disabled={loading}
                    >
                      <Trash2 />
                    </Button>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No comments yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPage;
