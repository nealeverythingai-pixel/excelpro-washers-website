"use client";

import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
}

export function BlogList({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(posts.map((post) => post.category)))];

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  return (
    <div className="mx-auto mt-16 max-w-7xl px-6 lg:px-8">
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === category
                ? "bg-primary-600 text-white shadow-md transform scale-105"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {filteredPosts.map((post) => (
          <article
            key={post.slug}
            className="flex flex-col items-start justify-between rounded-2xl bg-gray-50 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-x-4 text-xs">
              <time dateTime={post.date} className="text-gray-500">
                {new Date(post.date).toLocaleDateString()}
              </time>
              <span className="relative z-10 rounded-full bg-primary-50 px-3 py-1.5 font-medium text-primary-600 hover:bg-primary-100">
                {post.category}
              </span>
            </div>
            <div className="group relative">
              <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                <Link href={`/blog/${post.slug}`}>
                  <span className="absolute inset-0" />
                  {post.title}
                </Link>
              </h3>
              <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">
                {post.excerpt}
              </p>
            </div>
            <div className="mt-4 flex w-full">
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-semibold leading-6 text-primary-600 hover:text-primary-500"
              >
                Read more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
