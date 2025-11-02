export default function Card({ title, children }) {
  return (
    <div className="card">
      <h4 className="lux-accent">{title}</h4>
      {children}
    </div>
  );
}
