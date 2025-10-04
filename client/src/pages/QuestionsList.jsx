import React, { useEffect, useState } from "react";

export default function QuestionsList() {
  const [allquestions, setAllQuestions] = useState([]);
  const [questions,setQuestions] = useState([]);


  useEffect(() => {
    fetch("http://localhost:4000/api/questions")
      .then(res => res.json())
      .then(setAllQuestions)
      .catch(console.error);
  }, []);


 const getReactQuestions = ()=>{
   const react= allquestions.filter(q=>q.category==="react")
   setQuestions(react)
  }

 const getJavascriptQuestions = ()=>{
   const javascript= allquestions.filter(q=>q.category==="Javascript")
   setQuestions(javascript)
  }

   const getHtmlQuestions = ()=>{
   const html= allquestions.filter(q=>q.category==="HTML")
   setQuestions(html)
  }

   const getCssQuestions = ()=>{
   const css= allquestions.filter(q=>q.category==="CSS")
   setQuestions(css)
  }




  return (
    <div style={{ padding: 20 }}>
      <h2>Questions</h2>
      <div className="bg-black text-white p-4 m-4 flex gap-4  ">
        <button onClick={getJavascriptQuestions}>Javascript</button>
        <button onClick={getReactQuestions}>React</button>
        <button onClick={getHtmlQuestions}>HTML</button>
        <button onClick={getCssQuestions}>CSS</button>
      
      </div>

    <RenderQuestions questions={questions} allquestions={allquestions}/>
      {/* <ul>
        {questions.map(q => (
          <li className="border-b border" key={q._id}>
            <a  href={`/question/${q.slug}`}>Title:{q.title}</a> 
            <p>Description:{q.description}</p>
            <p>Difficulty:{q.difficulty}</p>
            <p>Category:{q.category}</p>
            <p> Number of people solved:{q.solved} </p>
          </li>
        ))}
      </ul> */}
      <div style={{ marginTop: 12 }}>
        <a href="/">Back</a>
      </div>
    </div>
  );
}



function RenderQuestions({questions,allquestions}){
  if(questions.length){
    return (
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
    )
  }else
  return (
          <ul>
        {allquestions.map(q => (
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
  )
}