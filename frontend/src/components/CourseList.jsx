import Card from './Card'

function CourseList({ courses, onEnroll }) {
  return (
    <div className="course-list">
      {courses.map(course => (
        <Card key={course.id} title={course.title}>
          <p>{course.description}</p>
          <p className="price">KSH {course.price}</p>
          {onEnroll && (
            <button onClick={() => onEnroll(course.id)}>
              Enroll
            </button>
          )}
        </Card>
      ))}
    </div>
  )
}

export default CourseList