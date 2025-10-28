export default function Card({ title, children }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: 15, margin: 10 }}>
      <h4>{title}</h4>
      {children}
    </div>
  );
}
