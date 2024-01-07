"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface Page {
  title: string;
  completed: boolean;
  path: string;
}

const Sidebar: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([
    { title: 'Introduction', completed: false, path: '/' },
    { title: 'Step 1: Introduction', completed: false, path: '/step1' }
    // ... other pages
  ]);

  return (
    <div className="w-64 h-screen bg-white p-5">
      <ul>
        {pages.map((page, index) => (
          <li key={index} className="flex items-center mb-2">
            <Link href={page.path}>
              <span className={`flex items-center w-full text-gray-800 ${page.completed ? "some-completed-class" : ""}`}>
                {page.completed && (
                  <svg className="fill-current text-green-500 w-6 h-6 mr-2" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7.629 14.571L3.057 10l-1.414 1.414L7.629 17.4l10.828-10.829-1.414-1.414z"/>
                  </svg>
                )}
                {page.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
