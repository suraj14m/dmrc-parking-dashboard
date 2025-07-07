
export function Card({ children }) {
  return <div className="rounded-2xl border bg-white shadow p-4">{children}</div>;
}

export function CardContent({ children }) {
  return <div>{children}</div>;
}
