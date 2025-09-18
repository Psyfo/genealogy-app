"use client";

export default function LoadingState() {
  return (
    <div className="flex flex-col justify-center items-center py-16 text-brown-rust">
      <div className="mb-4 border-[3px] border-t-brown-rust border-brown-rust/20 rounded-full w-10 h-10 animate-spin"></div>
      <p className="font-body text-sm">Loading people...</p>
    </div>
  );
}
