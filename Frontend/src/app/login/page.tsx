"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAppData } from "@/context/AppContext";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import { userService } from "@/services";

const LoginPage = () => {
  const { isAuth, setIsAuth, loading, setLoading, setUser } = useAppData();
  console.log("CLIENT ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
  type AuthResult = { code?: string; [key: string]: unknown };

  const responseGoogle = async (authResult: AuthResult) => {
    setLoading(true);
    try {
      const result = await userService.loginUser(authResult.code);

      Cookies.set("token", result.token, {
        expires: 5,
        secure: true,
        path: "/",
      });
      toast.success(result.message);
      setIsAuth(true);
      setLoading(false);
      setUser(result.user);
    } catch (error) {
    console.log("Full error:", error);
    console.log("Error response:", (error as any)?.response?.data);
    console.log("Error status:", (error as any)?.response?.status);
    toast.error((error as any)?.response?.data?.message || "Problem while logging in");
    setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });
  const router = useRouter();
  if (isAuth) { router.push("/blogs"); return null; }
  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-md items-center px-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-2xl">
                Login to The Reading Retreat
              </CardTitle>
              <CardDescription>Your calm corner for thoughtful blogs.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={googleLogin} className="h-11 w-full gap-2">
                Login with Google
                <img
                  src={"/google.png"}
                  className="w-6 h-6"
                  alt="google icon"
                />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LoginPage;
