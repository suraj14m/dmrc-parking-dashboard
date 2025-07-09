// src/components/ui/input.js
export default function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`border rounded px-2 py-1 focus:outline-none focus:ring w-full ${className}`}
    />
  );
}
