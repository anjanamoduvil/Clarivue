import React from 'react';

const QuizPopup = ({ question, options, onAnswer }) => {
  return (
    <>
      <div className="modal-overlay" />
      <div className="quiz-popup">
        <h2>Quick Quiz!</h2>
        <div className="quiz-question">
          {question}
        </div>
        <div className="quiz-options">
          {options.map((option, index) => (
            <button
              key={index}
              className="quiz-option"
              onClick={() => onAnswer(index)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default QuizPopup;
