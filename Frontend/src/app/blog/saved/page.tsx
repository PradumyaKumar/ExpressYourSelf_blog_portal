"use client";
import BlogCard from "@/components/BlogCard";
import Loading from "@/components/loading";
import { useAppData } from "@/context/AppContext";
import React from "react";

const SavedBlogs = () => {
  const { savedBlogs } = useAppData();

  if (!savedBlogs) {
    return <Loading />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
          Your library
        </p>
        <h1 className="mt-2 text-4xl font-bold text-foreground">
          Saved Blogs
        </h1>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {savedBlogs.length > 0 ? (
          savedBlogs.map((e, i) => {
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
          })
        ) : (
          <p className="rounded-lg border border-border bg-card p-6 text-muted-foreground">
            No saved blogs yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default SavedBlogs;
