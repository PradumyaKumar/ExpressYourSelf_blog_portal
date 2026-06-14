"use client";

import Loading from "@/components/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { userService } from "@/services";
import type { User } from "@/services/types";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await userService.getUserProfile(id);
        setProfile(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [id]);

  if (loading) return <Loading />;

  if (!profile) {
    return (
      <p className="container mx-auto px-4 py-6 text-muted-foreground">
        Profile not found
      </p>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <img
            src={profile.image}
            alt={profile.name}
            className="h-20 w-20 rounded-full border-2 border-primary/60 object-cover shadow-lg"
          />
          <div>
            <CardTitle className="text-2xl">{profile.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
          <div className="flex items-center gap-3">
            {profile.instagram && (
              <a
                href={profile.instagram}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Instagram />
              </a>
            )}
            {profile.facebook && (
              <a
                href={profile.facebook}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Facebook />
              </a>
            )}
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground hover:text-primary"
              >
                <Linkedin />
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
