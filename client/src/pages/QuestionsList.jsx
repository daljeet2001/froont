import React, { useEffect, useState } from "react";

export default function QuestionsList() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/questions")
      .then(res => res.json())
      .then(setQuestions)
      .catch(console.error);
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Questions</h2>
      <ul>
        {questions.map(q => (
          <li className="border-b border" key={q._id}>
            <a  href={`/question/${q.slug}`}>Title:{q.title}</a> 
            <p>Description:{q.description}</p>
            <p>Difficulty:{q.difficulty}</p>
            <p>Category:{q.category}</p>
            {/* <p>{q.examples}</p> */}
            <p> Number of people solved:{q.solved} </p>
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 12 }}>
        <a href="/">Back</a>
      </div>
    </div>
  );
}

