export default function Button({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm ${className}`}
    >
      {children}
    </button>
  );
}