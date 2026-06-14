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
import { RefreshCw } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { blogCategories, useAppData } from "@/context/AppContext";
import toast from "react-hot-toast";
import { authorService } from "@/services";
import type { BlogFormPayload } from "@/services/author.service";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

const AddBlog = () => {
  const editor = useRef(null);
  const [content, setContent] = useState("");

  const { fetchBlogs } = useAppData();

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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await authorService.createBlog(formData);

      toast.success(data.message);
      setFormData({
        title: "",
        description: "",
        category: "",
        image: null,
        blogcontent: "",
      });
      setContent("");
      setTimeout(() => {
        fetchBlogs();
      }, 4000);
    } catch (error) {
      toast.error("Error while adding blog");
    } finally {
      setLoading(false);
    }
  };

  const [aiTitle, setAiTitle] = useState(false);

  const aiTitleResponse = async () => {
    try {
      setAiTitle(true);
      const data = await authorService.generateTitle(formData.title);
      setFormData({ ...formData, title: data });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiTitle(false);
    }
  };

  const [aiDescripiton, setAiDescription] = useState(false);

  const aiDescriptionResponse = async () => {
    try {
      setAiDescription(true);
      const data = await authorService.generateDescription(
        formData.title,
        formData.description
      );
      setFormData({ ...formData, description: data });
    } catch (error) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiDescription(false);
    }
  };

  const [aiBlogLoading, setAiBlogLoading] = useState(false);

  const aiBlogResponse = async () => {
    try {
      setAiBlogLoading(true);
      const data = await authorService.generateBlogContent(
        formData.blogcontent
      );
      setContent(data.html);
      setFormData({ ...formData, blogcontent: data.html });
    } catch (error: any) {
      toast.error("Problem while fetching from ai");
      console.log(error);
    } finally {
      setAiBlogLoading(false);
    }
  };

  const config = useMemo(
    () => ({
      readonly: false, // all options from https://xdsoft.net/jodit/docs/,
      placeholder: "Start typings...",
    }),
    []
  );
  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
            Author studio
          </p>
          <h2 className="text-3xl font-bold">Add New Blog</h2>
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
                className={
                  aiTitle ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  type="button"
                  onClick={aiTitleResponse}
                  disabled={aiTitle}
                >
                  <RefreshCw className={aiTitle ? "animate-spin" : ""} />
                </Button>
              )}
            </div>

            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Blog descripiton"
                className={
                  aiDescripiton ? "animate-pulse placeholder:opacity-60" : ""
                }
                required
              />
              {formData.title === "" ? (
                ""
              ) : (
                <Button
                  onClick={aiDescriptionResponse}
                  type="button"
                  disabled={aiDescripiton}
                >
                  <RefreshCw className={aiDescripiton ? "animate-spin" : ""} />
                </Button>
              )}
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
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div>
              <Label>Blog Content</Label>
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-muted-foreground">
                  Paste you blog or type here. You can use rich text formatting.
                  Please add image after improving your grammer
                </p>
                <Button
                  type="button"
                  size={"sm"}
                  onClick={aiBlogResponse}
                  disabled={aiBlogLoading}
                >
                  <RefreshCw
                    size={16}
                    className={aiBlogLoading ? "animate-spin" : ""}
                  />
                  <span className="ml-2">Fix Grammer</span>
                </Button>
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

export default AddBlog;
