"use client";
import BlogCard from "@/components/BlogCard";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { useAppData } from "@/context/AppContext";
import { Filter } from "lucide-react";
import React from "react";

const Blogs = () => {
  const { toggleSidebar } = useSidebar();
  const { loading, blogLoading, blogs } = useAppData();
  console.log(blogs);
  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
                Fresh reads
              </p>
              <h1 className="mt-2 text-4xl font-bold text-foreground">
                Latest Blogs
              </h1>
              <p className="mt-2 max-w-xl text-muted-foreground">
                Browse new stories, ideas, and saved notes from the community.
              </p>
            </div>
            <Button
              onClick={toggleSidebar}
              className="flex h-10 items-center gap-2 px-4"
            >
              <Filter size={18} />
              <span>Filter Blogs</span>
            </Button>
          </div>
          {blogLoading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {blogs?.length === 0 && (
                <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
                  No blogs yet.
                </p>
              )}
              {blogs &&
                blogs.map((e, i) => {
                  return (
                    <BlogCard
                      key={i}
                      image={e.image}
                      title={e.title}
                      desc={e.description}
                      id={e.id}
                      time={e.created_at || e.create_at || ""}
                    />
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;
