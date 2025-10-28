export default function CourseList({ items }) {
  return (
    <ul>
      {items.map(i => <li key={i.id}>{i.title}</li>)}
    </ul>
  );
}
