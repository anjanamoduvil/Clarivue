import React, { useState, useCallback } from "react";
import UploadNotes from "./components/UploadNotes";
import FocusTimer from "./components/FocusTimer";
import BreakModal from "./components/BreakModal";
import QuizPopup from "./components/QuizPopup";
import './App.css';

function App() {
  const [notes, setNotes] = useState("");
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizData, setQuizData] = useState(null);
  const [userScore, setUserScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const generateQuizQuestion = useCallback((text) => {
    // Split text into sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length < 4) return;

    // Randomly select a sentence for the question
    const questionIndex = Math.floor(Math.random() * sentences.length);
    const questionSentence = sentences[questionIndex].trim();

    // Create a cloze question by removing a key word
    const words = questionSentence.split(' ').filter(w => w.length > 4);
    const targetIndex = Math.floor(words.length / 2);
    const correctAnswer = words[targetIndex];
    const questionText = questionSentence.replace(correctAnswer, '_______');

    // Generate wrong options
    const otherWords = sentences
      .filter((_, i) => i !== questionIndex)
      .join(' ')
      .split(' ')
      .filter(word => word.length > 4);
    
    const wrongOptions = Array.from(new Set(otherWords))
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine and shuffle all options
    const options = [correctAnswer, ...wrongOptions]
      .sort(() => Math.random() - 0.5);

    setQuizData({
      question: 'Fill in the blank:\n' + questionText,
      options,
      correctAnswer,
      correctIndex: options.indexOf(correctAnswer)
    });
    setTotalQuestions(prev => prev + 1);
  }, []);

  const handleQuizAnswer = (selectedIndex) => {
    if (quizData && selectedIndex === quizData.correctIndex) {
      setUserScore(prev => prev + 1);
    }
    setQuizData(null);
  };

  const handleFocusLost = () => {
    setShowBreakModal(true);
  };

  const handleNotesProcessed = (processedNotes) => {
    setNotes(processedNotes);
    generateQuizQuestion(processedNotes);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📖 Clarivue - Smart Study Assistant</h1>
        {notes && (
          <div className="score-display">
            Score: {userScore} / {totalQuestions}
          </div>
        )}
      </header>

      <main className="main-content">
        <div className="card">
          <h2>Focus Timer</h2>
          {!timerStarted ? (
            <button 
              className="button button-primary"
              onClick={() => setTimerStarted(true)}
            >
              Start Focus Timer
            </button>
          ) : (
            <FocusTimer onFocusLost={handleFocusLost} isActive={timerStarted} />
          )}
        </div>

        <div className="card">
          <h2>Study Material</h2>
          <UploadNotes 
            setNotes={handleNotesProcessed}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>
      </main>

      {notes && (
        <div className="notes-display">
          <h2>Processed Notes</h2>
          {isLoading ? (
            <div className="loading-spinner" />
          ) : (
            <div>{notes}</div>
          )}
        </div>
      )}

      {quizData && (
        <QuizPopup
          question={quizData.question}
          options={quizData.options}
          onAnswer={handleQuizAnswer}
        />
      )}

      <BreakModal 
        show={showBreakModal}
        onClose={() => {
          setShowBreakModal(false);
          generateQuizQuestion(notes);
        }}
      />
    </div>
  );
}

export default App;
