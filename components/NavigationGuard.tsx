import React, { useEffect } from "react";
import { useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/stores";

interface NavigationGuardProps {
  children: React.ReactNode;
}

export default function NavigationGuard({ children }: NavigationGuardProps) {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    // If user is authenticated and tries to access auth screens, redirect to main app
    if (isAuthenticated) {
      const currentPath = "/" + segments.join("/");
      const authPaths = [
        "/auth/login",
        "/auth/signup",
        "/auth/forgot-password",
        "/welcome",
        "/onboarding",
      ];

      if (authPaths.includes(currentPath)) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, segments, router]);

  return <>{children}</>;
}
