export default function Input({ className = '', ...props }) {
  return (
    <input
      {...props}
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm ${className}`}
    />
  );
}