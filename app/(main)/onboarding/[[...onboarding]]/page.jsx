"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();

  useEffect(() => {
    // simply redirect to team list, as organizations are fixed
    router.push("/team");
  }, []);

  return null;
}
