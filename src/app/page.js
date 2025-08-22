"use client";

import { toast } from "react-toastify";

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center">
      <button
        onClick={() => toast.success("Hello from Toastify! 🎉")}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Show Toast
      </button>
    </div>
  );
}
