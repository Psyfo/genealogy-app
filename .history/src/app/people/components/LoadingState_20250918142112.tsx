"use client";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-brown-rust">
      <div className="w-10 h-10 border-[3px] border-brown-rust/20 border-t-brown-rust rounded-full animate-spin mb-4"></div>
      <p className="font-body text-sm">Loading people...</p>
    </div>
  );
}
