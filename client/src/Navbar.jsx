import React from "react";
import { FloatingNav } from "./pages/FloatingNav";
import { IconHome, IconMessage, IconUser } from "@tabler/icons-react";

export function FloatingNavDemo() {
  const navItems = [
    {
      name: "Home",
      link: "/",
      icon: <IconHome className="h-5 w-5" />,
    },
    {
      name: "About",
      link: "/about",
      icon: <IconUser className="h-5 w-5" />,
    },
    {
      name: "Contact",
      link: "/contact",
      icon: <IconMessage className="h-5 w-5" />,
    },
  ];

  return (
    <div>
      <FloatingNav navItems={navItems} />
      <DummyContent />
    </div>
  );
}

const DummyContent = () => {
  return (
    <div className=" w-full bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
      
    </div>
  );
};
