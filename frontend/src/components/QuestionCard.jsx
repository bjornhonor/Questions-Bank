// /frontend/src/components/QuestionCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// O estilo pode ficar aqui dentro para simplificar
const cardStyle = {
  border: '1px solid #ccc',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '16px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
};

const headerStyle = {
  marginBottom: '8px',
  color: '#555',
  fontSize: '0.9em',
};

const textStyle = {
  fontSize: '1.1em',
  textDecoration: 'none', // Remove o sublinhado do link
  color: 'black'
};

function QuestionCard({ question }) {
  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        {question.area} - {question.topic}
      </div>
      <Link to={`/questions/${question._id}`} style={textStyle}>
        <p>{question.questionText}</p>
      </Link>
    </div>
  );
}

export default QuestionCard;