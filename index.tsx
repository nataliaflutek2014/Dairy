// FIX: 'React' refers to a UMD global, but the current file is a module. Consider adding an import instead.
import React, { useState, useEffect, useMemo } from 'react';
// FIX: 'ReactDOM' refers to a UMD global, but the current file is a module. Consider adding an import instead. Also, use createRoot for React 18.
import { createRoot } from 'react-dom/client';

// FIX: Property 'jspdf' does not exist on type 'Window & typeof globalThis'.
declare global {
    interface Window { 
        jspdf: any;
        html2canvas: any;
     }
}

const questions = {
    start: [
        { id: 'start_q1', text: 'Что вы надеетесь получить от этого курса? Какие у вас ожидания?' },
        { id: 'start_q2', text: 'Опишите сильные стороны вашего ребенка. Что у него получается лучше всего?' },
        { id: 'start_q3', text: 'Какие трудности в общении и взаимодействии с ребенком вы испытываете сейчас?' },
        { id: 'start_q4',text: 'Как вы сейчас понимаете внутренний мир и мотивацию вашего ребенка?' }
    ],
    middle: [
        { id: 'middle_q1', text: 'Какие изменения в поведении или общении ребенка вы заметили с начала курса?' },
        { id: 'middle_q2', text: 'Что нового вы узнали о своем ребенке и о себе как о родителе?' },
        { id: 'middle_q3', text: 'Какие стратегии из курса оказались наиболее полезными для вашей семьи?' },
        { id: 'middle_q4', text: 'Изменилось ли ваше понимание его трудностей? Если да, то как?' }
    ],
    end: [
        { id: 'end_q1', text: 'Оглядываясь назад, как изменились ваши отношения с ребенком за время курса?' },
        { id: 'end_q2', text: 'Какие навыки и сильные стороны вы помогли развить у вашего ребенка?' },
        { id: 'end_q3', text: 'Сравните свои ответы в начале и в конце курса. Что изменилось в вашем восприятии?' },
        { id: 'end_q4', text: 'Какие ваши дальнейшие шаги в поддержке развития вашего ребенка?' }
    ]
};

const feedbackMessages = [
    "Спасибо, что поделились своими мыслями. Рефлексия — это важный шаг к пониманию и росту.",
    "Вы делаете огромную работу. Каждый ваш шаг, даже самый маленький, имеет большое значение.",
    "Замечательно, что вы уделяете время анализу. Это помогает увидеть общую картину и заметить прогресс.",
    "Ваши наблюдения очень ценны. Продолжайте в том же духе, вы на верном пути!",
    "Помните, что забота о себе так же важна, как и забота о ребенке. Вы — самый главный ресурс вашей семьи."
];

const JournalSection = ({ title, questions, answers, setAnswers, sectionKey }) => {
    const [isSaved, setIsSaved] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [isOpen, setIsOpen] = useState(sectionKey === 'start');

    const handleInputChange = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
        setIsSaved(false);
        setFeedback('');
    };

    const handleSave = () => {
        const sectionAnswers = questions.map(q => answers[q.id] || '').join('');
        if (sectionAnswers.trim().length > 0) {
            localStorage.setItem('journalAnswers', JSON.stringify(answers));
            setIsSaved(true);
            setFeedback(feedbackMessages[Math.floor(Math.random() * feedbackMessages.length)]);
        } else {
            alert('Пожалуйста, ответьте хотя бы на один вопрос, прежде чем сохранять.');
        }
    };
    
    useEffect(() => {
        const allAnswered = questions.every(q => (answers[q.id] || '').trim().length > 0);
        if (allAnswered) {
             setIsSaved(true);
        }
    }, [answers, questions]);

    return (
        <div className="journal-section">
            <div className="section-header" onClick={() => setIsOpen(!isOpen)} role="button" aria-expanded={isOpen}>
                {title} {isOpen ? '−' : '+'}
            </div>
            {isOpen && (
                <div className="section-content">
                    {questions.map(({ id, text }) => (
                        <div key={id} className="question-group">
                            <label htmlFor={id}>{text}</label>
                            <textarea
                                id={id}
                                value={answers[id] || ''}
                                onChange={(e) => handleInputChange(id, e.target.value)}
                                // FIX: Type 'string' is not assignable to type 'number'. The rows attribute expects a number.
                                rows={5}
                            />
                        </div>
                    ))}
                    <div className="actions">
                        <button onClick={handleSave} className={`button ${isSaved ? 'button-saved' : 'button-primary'}`}>
                            {isSaved ? 'Сохранено ✓' : 'Сохранить'}
                        </button>
                    </div>
                    {feedback && <div className="feedback-box">{feedback}</div>}
                </div>
            )}
        </div>
    );
};


const App = () => {
    const [answers, setAnswers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    useEffect(() => {
        try {
            const savedAnswers = localStorage.getItem('journalAnswers');
            if (savedAnswers) {
                setAnswers(JSON.parse(savedAnswers));
            }
        } catch (error) {
            console.error("Failed to load answers from localStorage", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const generatePdf = () => {
        const input = document.getElementById('journal-content');
        if (!input) {
            console.error("Элемент для генерации PDF не найден!");
            return;
        }

        setIsGeneratingPdf(true);

        // Временно скроем кнопку, чтобы она не попала в PDF
        const pdfButton = input.querySelector('.button-secondary');
        if (pdfButton instanceof HTMLElement) {
             pdfButton.style.display = 'none';
        }

        window.html2canvas(input, {
            scale: 2, // Улучшение качества изображения
            useCORS: true
        }).then(canvas => {
            // Возвращаем кнопку обратно
             if (pdfButton instanceof HTMLElement) {
                pdfButton.style.display = 'block';
            }

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const canvasAspectRatio = canvas.height / canvas.width;
            const imgHeight = pdfWidth * canvasAspectRatio;
            const pdfHeight = pdf.internal.pageSize.getHeight();

            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) {
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdfHeight;
            }
            
            pdf.save('Дневник_Флортайм.pdf');
            setIsGeneratingPdf(false);
        }).catch(err => {
            console.error("Ошибка при создании PDF:", err);
             if (pdfButton instanceof HTMLElement) {
                pdfButton.style.display = 'block';
            }
            setIsGeneratingPdf(false);
            alert('Не удалось создать PDF. Пожалуйста, попробуйте еще раз.');
        });
    };
    
    if (isLoading) {
        return <div>Загрузка дневника...</div>;
    }

    return (
        <div className="app-container" id="journal-content">
            <div className="header">
                <h1>Домашний Флортайм</h1>
                <p>Дневник рефлексии</p>
            </div>
            
            <JournalSection 
                title="Начало курса" 
                questions={questions.start} 
                answers={answers} 
                setAnswers={setAnswers}
                sectionKey="start"
            />
            <JournalSection 
                title="Середина курса" 
                questions={questions.middle} 
                answers={answers} 
                setAnswers={setAnswers}
                sectionKey="middle"
            />
            <JournalSection 
                title="Конец курса" 
                questions={questions.end} 
                answers={answers} 
                setAnswers={setAnswers}
                sectionKey="end"
            />
            
             <div className="actions">
                <button 
                    onClick={generatePdf} 
                    className="button button-secondary"
                    disabled={isGeneratingPdf}
                >
                    {isGeneratingPdf ? 'Создание PDF...' : 'Скачать всё в PDF'}
                </button>
            </div>
        </div>
    );
};

// FIX: 'ReactDOM' refers to a UMD global, and `render` does not exist on `ReactDOM` in React 18. Use `createRoot` instead.
const container = document.getElementById('root');
if (container) {
    const root = createRoot(container);
    root.render(<App />);
}