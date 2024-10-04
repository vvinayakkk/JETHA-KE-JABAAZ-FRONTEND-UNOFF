"use client";

import React from "react";
import { InfiniteMovingCards } from "./pages/InfiniteMoving";

export function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </div>
  );
}

const testimonials = [
    {
      quote:
        "I never knew a product could be this effective! It has transformed my daily routine and improved my overall experience. Highly recommend it!",
      name: "Rahul Sharma",
      title: "Satisfied Customer",
    },
    {
      quote:
        "The quality of this product exceeded my expectations. It's not only functional but also stylish. Kudos to the team for such a fantastic job!",
      name: "Priya Gupta",
      title: "Fashion Enthusiast",
    },
    {
      quote:
        "I am extremely happy with my purchase. It has truly made my life easier. I can't imagine going back to how things were before!",
      name: "Amit Desai",
      title: "Daily User",
    },
    {
      quote:
        "A fantastic product that delivers on its promises! I've seen a noticeable difference since I started using it. Will definitely buy again.",
      name: "Sneha Iyer",
      title: "Health Advocate",
    },
    {
      quote:
        "This is a game-changer! The features are well thought out, and the performance is top-notch. Highly recommend it to everyone!",
      name: "Vikram Rao",
      title: "Tech Savvy",
    },
  ];
  
