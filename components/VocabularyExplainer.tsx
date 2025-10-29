
import React, { useState, useCallback } from 'react';
import { VocabularyEntry } from '../types';
import { explainVocabulary } from '../services/geminiService';

const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const ResultCard: React.FC<{ content: string; children?: React.ReactNode }> = ({ content, children }) => {
    return (
        <div className="mt-6 bg-slate-800 rounded-lg shadow-xl p-6 animate-fade-in-up">
            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">{content}</div>
            {children && <div className="mt-6 border-t border-slate-700 pt-4">{children}</div>}
        </div>
    );
};


interface VocabularyExplainerProps {
    onAddToLibrary: (entry: Omit<VocabularyEntry, 'id' | 'timestamp'>) => void;
}

const VocabularyExplainer: React.FC<VocabularyExplainerProps> = ({ onAddToLibrary }) => {
    const [wordInput, setWordInput] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<string | null>(null);

    const handleSubmit = useCallback(async () => {
        if (!wordInput.trim()) {
            setError("Please enter a Japanese word.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const explanation = await explainVocabulary(wordInput.trim());
            setResult(explanation);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [wordInput]);

    const handleSave = () => {
        if (result) {
            onAddToLibrary({
                word: wordInput.trim(),
                explanation: result,
            });
            alert("Saved to library!");
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-teal-400 mb-2">Vocabulary Explainer</h1>
            <p className="text-slate-400 mb-6">Enter a Japanese word (単語) to get its meaning and usage examples in Burmese.</p>

            <div className="flex space-x-2">
                <input
                    type="text"
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    placeholder="e.g., 勉強"
                    className="flex-grow p-4 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition duration-200"
                    disabled={isLoading}
                    onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSubmit()}
                />
                <button
                    onClick={handleSubmit}
                    disabled={isLoading || !wordInput.trim()}
                    className="flex items-center justify-center bg-teal-600 hover:bg-teal-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-lg"
                >
                    {isLoading ? <Spinner /> : 'Explain'}
                </button>
            </div>
            
            {error && <p className="mt-4 text-center text-red-400">{error}</p>}
            
            {result && (
                <ResultCard content={result}>
                    <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                        Save to Library
                    </button>
                </ResultCard>
            )}
        </div>
    );
};

export default VocabularyExplainer;
