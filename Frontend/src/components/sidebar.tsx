"use client";
import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { Input } from "./ui/input";
import { blogCategories, useAppData } from "@/context/AppContext";

const SideBar = () => {
  const { searchQuery, setSearchQuery, setCategory } = useAppData();

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar px-4 py-6 text-2xl font-bold text-sidebar-foreground">
        The Reading Retreat
      </SidebarHeader>
      <SidebarContent className="bg-sidebar text-sidebar-foreground">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Search
          </SidebarGroupLabel>
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your desired blog"
          />

          <SidebarGroupLabel className="mt-4 text-sidebar-foreground/70">
            Categories
          </SidebarGroupLabel>
          <SidebarMenu>
            {/* Fix: each item gets its OWN SidebarMenuItem wrapper */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setCategory("")}
                className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <span>All</span>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {blogCategories?.map((cat, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton
                  onClick={() => setCategory(cat)}
                  className="cursor-pointer hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span>{cat}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
