"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { blogCategories, useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";
import { useParams } from "next/navigation";
import { authorService, blogService } from "@/services";
import type { BlogFormPayload } from "@/services/author.service";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const EditBlogPage = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  const { fetchBlogs } = useAppData();

  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BlogFormPayload>({
    title: "",
    description: "",
    category: "",
    image: null,
    blogcontent: "",
  });

  const handleInputChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: any) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );

  const [existingImage, setExistingImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const data = await blogService.getSingleBlog(id);
        const blog = data.blog;

        setFormData({
          title: blog.title,
          description: blog.description,
          category: blog.category,
          image: null,
          blogcontent: blog.blogcontent,
        });

        setContent(blog.blogcontent);
        setExistingImage(blog.image);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBlog();
  }, [id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authorService.updateBlog(id, formData);

      toast.success(data.message);
      fetchBlogs();
    } catch (error) {
      toast.error("Error while adding blog");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Author studio
          </p>
          <h2 className="text-3xl font-bold">Edit Blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter Blog title"
                required
              />
            </div>

            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Blog descripiton"
                required
              />
            </div>

            <Label>Category</Label>
            <Select
              onValueChange={(value: any) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={formData.category || "Select category"}
                />
              </SelectTrigger>
              <SelectContent>
                {blogCategories?.map((e, i) => (
                  <SelectItem key={i} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div>
              <Label>Image Upload</Label>
              {existingImage && !formData.image && (
                <img
                  src={existingImage}
                  className="mb-3 h-40 w-40 rounded-lg border border-border object-cover"
                  alt=""
                />
              )}
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="mb-3 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Paste you blog or type here. You can use rich text formatting.
                  Please add image after improving your grammer
                </p>
              </div>
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <JoditEditor
                  ref={editor}
                  value={content}
                  config={config}
                  tabIndex={1}
                  onBlur={(newContent) => {
                    setContent(newContent);
                    setFormData({ ...formData, blogcontent: newContent });
                  }}
                />
              </div>
            </div>

            <Button type="submit" className="h-10 w-full" disabled={loading}>
              {loading ? "Submitting" : "Submit"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditBlogPage;
