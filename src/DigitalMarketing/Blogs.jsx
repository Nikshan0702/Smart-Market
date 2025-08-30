"use client";

import Link from "next/link";
import { Calendar, User } from "lucide-react";
import React from "react";

// Card Component
const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`border rounded-lg bg-white ${className}`} {...props}>
      {children}
    </div>
  );
};

// CardHeader Component
const CardHeader = ({ children, className = "" }) => {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
};

// CardTitle Component
const CardTitle = ({ children, className = "" }) => {
  return (
    <h3 className={`text-lg font-semibold ${className}`}>
      {children}
    </h3>
  );
};

// CardContent Component
const CardContent = ({ children, className = "" }) => {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
};

// Badge Component
const Badge = ({ children, className = "" }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      {children}
    </span>
  );
};

// Button Component
const Button = ({ children, variant = "default", size = "default", className = "", ...props }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-transparent hover:bg-gray-100 text-gray-700",
    ghost: "bg-transparent hover:bg-gray-100 text-gray-700",
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md text-xs",
    lg: "h-11 px-8 rounded-md",
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Blogs Component
const posts = [
  {
    id: 1,
    title: "The Future of Smart Healthcare in Sri Lanka",
    excerpt:
      "Discover how digital health solutions can transform urban hospitals, improve patient care, and optimize resources.",
    author: "Dr. Anushka Fernando",
    date: "Aug 25, 2025",
    tag: "Healthcare",
    image:
      "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Why Patient-Centered Systems Matter",
    excerpt:
      "Patient records and digital health cards are the backbone of modern medical ecosystems. Here's why they matter.",
    author: "Prof. Nirmala Perera",
    date: "Aug 20, 2025",
    tag: "Technology",
    image:
      "https://images.unsplash.com/photo-1581092580499-15d6b2d8d4d3?q=80&w=1920&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Lessons from Australia's My Health Record",
    excerpt:
      "What Sri Lanka can learn from global healthcare platforms like My Health Record and Singapore's NEHR.",
    author: "Dr. Sahan Jayawardena",
    date: "Aug 10, 2025",
    tag: "Case Study",
    image:
      "https://images.unsplash.com/photo-1629909613654-27f7f01c5a89?q=80&w=1920&auto=format&fit=crop",
  },
];

export default function Blogs() {
  return (
    <section className="container mx-auto px-4 py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
          Latest <span className="text-blue-600">Insights</span>
        </h2>
        <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
          Stay updated with the latest trends, case studies, and expert opinions
          in smart healthcare systems.
        </p>
      </div>

      {/* Blog Grid */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 rounded-xl border border-gray-200"
          >
            {/* Blog Image */}
            <div className="h-48 w-full overflow-hidden">
              <img
                src={post.image}
                alt={post.title}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>

            <CardHeader className="pb-4">
              <Badge className="mb-3">{post.tag}</Badge>
              <CardTitle className="text-xl font-semibold text-gray-900 mb-2 leading-tight">
                {post.title}
              </CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                {post.excerpt}
              </p>

              {/* Author & Date */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{post.date}</span>
                </div>
              </div>

              {/* Read More Button */}
              <Link href={`/blog/${post.id}`} className="block">
                <Button variant="outline" size="sm" className="w-full border-gray-300 hover:bg-gray-50 text-gray-700">
                  Read More
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8">
          Load More Articles
        </Button>
      </div>
    </section>
  );
}