import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    Send,
    Shield,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Sub-components (Defined outside App to prevent re-mounting) ---

const Landing = ({ userInfo, setUserInfo, onStart, onAdmin }) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card text-center">
        <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>NLP Master Quiz</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>
            Challenge yourself with 40 advanced questions on Word Embeddings, Transformers,
            and N-gram models.
        </p>

        <form onSubmit={onStart} style={{ maxWidth: '400px', margin: '0 auto' }}>
            <input
                type="text"
                placeholder="Enter Your Full Name"
                required
                style={{
                    width: '100%',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border)',
                    color: 'white',
                    marginBottom: '1rem',
                    outline: 'none'
                }}
                value={userInfo.name}
                onChange={e => setUserInfo({ ...userInfo, name: e.target.value })}
            />
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                Start Examination <ChevronRight size={20} />
            </button>
        </form>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <span className="stat-pill"><Shield size={14} /> Proctored Session</span>
            <span className="stat-pill"><Clock size={14} /> 40 Questions</span>
        </div>

        <button
            onClick={onAdmin}
            style={{ marginTop: '3rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}
        >
            <Settings size={14} /> Admin Dashboard
        </button>
    </motion.div>
);

const Quiz = ({ questions, currentIdx, setCurrentIdx, answers, selectOption, tabSwitches, timer, formatTime, submitQuiz }) => {
    const q = questions[currentIdx];
    if (!q) return null;

    return (
        <div className="container" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h4 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Question {currentIdx + 1} of {questions.length}</h4>
                    <div style={{ width: '200px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                            style={{ height: '100%', background: 'var(--primary)', borderRadius: '2px' }}
                        />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <span className="stat-pill" style={{ color: tabSwitches > 0 ? 'var(--error)' : '' }}>
                        Tab Switches: {tabSwitches}
                    </span>
                    <span className="stat-pill">{formatTime(timer)}</span>
                </div>
            </div>

            <motion.div
                key={currentIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card"
            >
                <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem', fontWeight: '600' }}>{q.question}</h2>

                <div className="options-list">
                    {q.options.map((opt, i) => (
                        <div
                            key={i}
                            className={`option-card ${answers[currentIdx] === i ? 'selected' : ''}`}
                            onClick={() => selectOption(i)}
                        >
                            <div className="option-dot" />
                            <span>{opt}</span>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2.5rem' }}>
                    <button
                        className="btn"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                        onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                        disabled={currentIdx === 0}
                    >
                        <ChevronLeft size={20} /> Previous
                    </button>

                    {currentIdx === questions.length - 1 ? (
                        <button
                            className="btn btn-primary"
                            style={{ background: 'var(--success)', boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.4)' }}
                            onClick={submitQuiz}
                        >
                            Submit Final Exam <Send size={20} />
                        </button>
                    ) : (
                        <button className="btn btn-primary" onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))}>
                            Next <ChevronRight size={20} />
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

const Result = ({ score, questions, userInfo, tabSwitches, timer, formatTime, onReview }) => {
    const percentage = (score / questions.length) * 100;

    return (
        <div className="container">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card text-center">
                <Trophy size={80} color="#fcd34d" style={{ marginBottom: '1.5rem', filter: 'drop-shadow(0 0 15px rgba(252, 211, 77, 0.4))' }} />
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Exam Completed!</h1>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Well done, {userInfo.name}! Here is your performance overview.</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '2rem', color: 'var(--primary)' }}>{score} / {questions.length}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Score Achieved</p>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '2rem', color: 'var(--accent)' }}>{percentage.toFixed(1)}%</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Accuracy</p>
                    </div>
                </div>

                <div style={{ textAlign: 'left', marginBottom: '2rem', background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px' }}>
                    <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertTriangle size={16} color="var(--warning)" /> Proctoring Report
                    </h4>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Suspicious Activity (Tab Switches/Blur): <b>{tabSwitches}</b>
                    </p>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        Total Time Taken: <b>{formatTime(timer)}</b>
                    </p>
                </div>

                <button className="btn btn-primary" style={{ width: '100%' }} onClick={onReview}>
                    Review All Answers <Eye size={20} />
                </button>
            </motion.div>
        </div>
    );
};

const Review = ({ questions, answers, onBack }) => (
    <div className="container" style={{ paddingBottom: '5rem' }}>
        <h2 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            Review Solutions <button className="stat-pill" onClick={onBack}>Back to Summary</button>
        </h2>
        {questions.map((q, idx) => (
            <div key={idx} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '1rem' }}>{idx + 1}. {q.question}</p>
                <div style={{ fontSize: '0.9rem' }}>
                    {q.options.map((opt, i) => {
                        const isCorrect = i === q.answer;
                        const isSelected = answers[idx] === i;
                        return (
                            <div key={i} style={{
                                padding: '0.75rem',
                                borderRadius: '8px',
                                marginBottom: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : isSelected ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                                border: isCorrect ? '1px solid rgba(16, 185, 129, 0.3)' : isSelected ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid transparent'
                            }}>
                                {isCorrect ? <CheckCircle2 size={16} color="var(--success)" /> : isSelected ? <XCircle size={16} color="var(--error)" /> : <div style={{ width: 16 }} />}
                                <span style={{ color: isCorrect ? 'var(--success)' : isSelected ? 'var(--error)' : 'inherit' }}>{opt}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);

const AdminView = ({ results, onBack, formatTime }) => (
    <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h1 className="title-gradient">Host Dashboard</h1>
            <button className="btn" onClick={onBack}><ChevronLeft /> Back</button>
        </div>

        {results.length === 0 ? (
            <p className="text-center" style={{ color: 'var(--text-muted)' }}>No submissions yet.</p>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {results.map((res, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0 }}>{res.name}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(res.timestamp).toLocaleString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--primary)' }}>{res.score}/40</div>
                                <p style={{ fontSize: '0.7rem', color: res.tabSwitches > 1 ? 'var(--error)' : 'var(--text-muted)' }}>
                                    {res.tabSwitches} switches | {formatTime(res.timeTaken)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
);

// --- Main App Component ---

const App = () => {
    const [step, setStep] = useState('landing');
    const [questions, setQuestions] = useState([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState({});
    const [userInfo, setUserInfo] = useState({ name: '', email: '' });
    const [tabSwitches, setTabSwitches] = useState(0);
    const [showAlert, setShowAlert] = useState(false);
    const [results, setResults] = useState([]);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef(null);

    useEffect(() => {
        axios.get('/api/questions').then(res => setQuestions(res.data));
    }, []);

    useEffect(() => {
        if (step !== 'quiz') return;
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                setTabSwitches(prev => prev + 1);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
            }
        };
        const handleBlur = () => {
            setTabSwitches(prev => prev + 1);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
        };
    }, [step]);

    useEffect(() => {
        if (step === 'quiz') {
            timerRef.current = setInterval(() => {
                setTimer(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [step]);

    const startQuiz = (e) => {
        e.preventDefault();
        if (!userInfo.name) return;
        setStep('quiz');
    };

    const selectOption = (optionIdx) => {
        setAnswers(prev => ({ ...prev, [currentIdx]: optionIdx }));
    };

    const calculateScore = () => {
        let score = 0;
        questions.forEach((q, idx) => {
            if (answers[idx] === q.answer) score++;
        });
        return score;
    };

    const submitQuiz = async () => {
        setStep('loading');
        const score = calculateScore();
        const finalData = { ...userInfo, answers, score, tabSwitches, timeTaken: timer };
        try {
            await axios.post('/api/submit', finalData);
            setStep('result');
            if (score > 30) confetti();
        } catch (err) {
            alert('Error submitting quiz. Please try again.');
            setStep('quiz');
        }
    };

    const fetchResults = async () => {
        try {
            const res = await axios.get('/api/results');
            setResults(res.data);
            setStep('admin');
        } catch (err) {
            alert('Failed to fetch results.');
        }
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="app">
            <AnimatePresence>
                {showAlert && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="proctor-alert">
                        <AlertTriangle size={20} /> Tab Switch Detected! Please stay on the page.
                    </motion.div>
                )}
            </AnimatePresence>

            <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {step === 'landing' && (
                    <Landing
                        userInfo={userInfo}
                        setUserInfo={setUserInfo}
                        onStart={startQuiz}
                        onAdmin={fetchResults}
                    />
                )}
                {step === 'quiz' && (
                    <Quiz
                        questions={questions}
                        currentIdx={currentIdx}
                        setCurrentIdx={setCurrentIdx}
                        answers={answers}
                        selectOption={selectOption}
                        tabSwitches={tabSwitches}
                        timer={timer}
                        formatTime={formatTime}
                        submitQuiz={submitQuiz}
                    />
                )}
                {step === 'loading' && <div className="glass-card">Submitting examination...</div>}
                {step === 'result' && (
                    <Result
                        score={calculateScore()}
                        questions={questions}
                        userInfo={userInfo}
                        tabSwitches={tabSwitches}
                        timer={timer}
                        formatTime={formatTime}
                        onReview={() => setStep('review')}
                    />
                )}
                {step === 'review' && (
                    <Review
                        questions={questions}
                        answers={answers}
                        onBack={() => setStep('result')}
                    />
                )}
                {step === 'admin' && (
                    <AdminView
                        results={results}
                        onBack={() => setStep('landing')}
                        formatTime={formatTime}
                    />
                )}
            </main>
        </div>
    );
};

export default App;
