"use client";

import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { Users } from "lucide-react";

const UserMenu = () => {
  return (
    <div className="flex items-center gap-3">
      <Link href="/team">
        <Button variant="outline" className="flex items-center gap-2">
          <Users size={18} />
          <span className="hidden md:inline">Teams</span>
        </Button>
      </Link>
      <UserButton
        appearance={{
          elements: {
            avatarBox: "w-10 h-10",
          },
        }}
      >
        <UserButton.MenuItems>
          {/* organization navigation removed */}
          <UserButton.Action label="manageAccount" />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
};

export default UserMenu;
