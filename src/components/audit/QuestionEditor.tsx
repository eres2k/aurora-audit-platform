import React from 'react';

interface Question {
  id: string;
  text: string;
  type: string;
}

interface Props {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export function QuestionEditor({ questions, onChange }: Props) {
  return (
    <div>
      {questions.map((q) => (
        <div key={q.id}>{q.text}</div>
      ))}
    </div>
  );
}
