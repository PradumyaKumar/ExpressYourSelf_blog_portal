"use client";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { CircleUserRoundIcon, LogIn, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppData } from "@/context/AppContext";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const { loading, isAuth, user } = useAppData();

  return (
    <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/78 px-4 py-3 shadow-[0_12px_34px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          href={"/blogs"}
          className="text-xl font-bold tracking-wide text-foreground"
        >
          The Reading Retreat
        </Link>

        <div className="md:hidden">
          <Button variant={"ghost"} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
        <ul className="hidden md:flex justify-center items-center space-x-6 text-sm font-medium text-muted-foreground">
          <li>
            <Link href={"/blogs"} className="hover:text-primary">
              Home
            </Link>
          </li>
          {isAuth && (
            <li>
              <Link href={"/blog/saved"} className="hover:text-primary">
                Saved Blogs
              </Link>
            </li>
          )}
          {loading ? (
            ""
          ) : (
            <li>
              {isAuth ? (
                <Link
                  href={`/profile/${user?._id}`}
                  className="hover:text-primary"
                >
                  <CircleUserRoundIcon />
                </Link>
              ) : (
                <Link href={"/login"} className="hover:text-primary">
                  <LogIn />
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <ul className="mt-3 flex flex-col justify-center items-center space-y-4 rounded-lg border border-border bg-card p-4 text-muted-foreground shadow-xl">
          <li>
            <Link href={"/blogs"} className="hover:text-primary">
              Home
            </Link>
          </li>
          {isAuth && (
            <li>
              <Link href={"/blog/saved"} className="hover:text-primary">
                Saved Blogs
              </Link>
            </li>
          )}
          {loading ? (
            ""
          ) : (
            <li>
              {isAuth ? (
                <Link
                  href={`/profile/${user?._id}`}
                  className="hover:text-primary"
                >
                  <CircleUserRoundIcon />
                </Link>
              ) : (
                <Link href={"/login"} className="hover:text-primary">
                  <LogIn />
                </Link>
              )}
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
