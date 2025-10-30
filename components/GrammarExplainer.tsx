import React, { useState, useCallback } from 'react';
import { GrammarEntry } from '../types';
import { explainGrammar } from '../services/geminiService';

// A simple component to render markdown for bold text without using dangerouslySetInnerHTML
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold tags, keeping them
    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={index} className="text-sky-300 font-semibold">{part.slice(2, -2)}</strong>;
                }
                return part;
            })}
        </>
    );
};


const Spinner: React.FC = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

interface ParsedGrammarEntry {
    form: string;
    explanation: string;
}

interface GrammarExplainerProps {
    onAddToLibrary: (entry: Omit<GrammarEntry, 'id' | 'timestamp'>) => void;
}

const GrammarExplainer: React.FC<GrammarExplainerProps> = ({ onAddToLibrary }) => {
    const [textInput, setTextInput] = useState<string>('');
    const [fileInput, setFileInput] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [results, setResults] = useState<ParsedGrammarEntry[]>([]);
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileInput(file);
            setFileName(file.name);
            setTextInput('');
        }
    };

    const handleSubmit = useCallback(async () => {
        const input = fileInput || textInput;
        if (!input) {
            setError("Please provide text or an image.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResults([]);

        try {
            const stream = explainGrammar(input);
            let buffer = '';
            
            for await (const chunk of stream) {
                buffer += chunk;

                const startMarker = "Grammar form. Found.";
                if (buffer.includes(startMarker)) {
                    buffer = buffer.replace(startMarker, "").trim();
                }

                while (buffer.includes('---')) {
                    const parts = buffer.split('---');
                    const completePart = parts.shift();
                    buffer = parts.join('---');

                    if (completePart && completePart.trim()) {
                        const lines = completePart.trim().split('\n');
                        const form = lines[0]?.trim() || 'Unknown Form';
                        const explanation = lines.slice(1).join('\n').trim();
                        if (explanation && form) {
                            setResults(prev => [...prev, { form, explanation }]);
                        }
                    }
                }
            }
            
            // Process any remaining content in the buffer
            if (buffer.trim()) {
                const lines = buffer.trim().split('\n');
                const form = lines[0]?.trim() || 'Unknown Form';
                const explanation = lines.slice(1).join('\n').trim();
                 if (explanation && form) {
                    setResults(prev => [...prev, { form, explanation }]);
                }
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : "An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [textInput, fileInput]);
    
    const handleSave = () => {
        if (results) {
            results.forEach(result => {
                onAddToLibrary({
                    source: result.form.replace(/\*\*/g, ''), // remove markdown for title
                    explanation: result.explanation,
                });
            });
            alert(`Saved ${results.length} grammar patterns to library!`);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-sky-400 mb-2">Grammar Explainer</h1>
            <p className="text-slate-400 mb-6">Type a Japanese sentence or upload an image to get grammar explanations in Burmese.</p>

            <div className="space-y-4">
                <textarea
                    value={textInput}
                    onChange={(e) => {
                        setTextInput(e.target.value);
                        setFileInput(null);
                        setFileName('');
                    }}
                    placeholder="e.g., 天気がいいから、散歩しましょう。"
                    className="w-full h-32 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-200 resize-none"
                    disabled={isLoading}
                />

                <div className="flex items-center justify-center w-full">
                    <span className="text-slate-500 mx-4">OR</span>
                </div>

                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-lg cursor-pointer bg-slate-800 hover:bg-slate-700 transition duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/></svg>
                        <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-slate-500">PNG, JPG, or WEBP</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} disabled={isLoading} />
                </label>
                {fileName && <p className="text-sm text-center text-slate-400">Selected file: {fileName}</p>}

                <button
                    onClick={handleSubmit}
                    disabled={isLoading || (!textInput && !fileInput)}
                    className="w-full flex items-center justify-center bg-sky-600 hover:bg-sky-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 shadow-lg"
                >
                    {isLoading ? <Spinner /> : 'Explain Grammar'}
                </button>
            </div>
            
            {error && <p className="mt-4 text-center text-red-400">{error}</p>}
            
            {(results.length > 0 || isLoading) && (
                <div className="mt-6 space-y-4">
                    {results.map((result, index) => (
                        <div 
                           key={index} 
                           className="bg-slate-800 rounded-lg shadow-xl p-6 animate-fade-in-up"
                           style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <h3 className="text-lg font-bold text-slate-100 mb-3">
                               <SimpleMarkdown text={result.form} />
                            </h3>
                            <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                                <SimpleMarkdown text={result.explanation} />
                            </div>
                        </div>
                    ))}
                     {results.length > 0 && !isLoading && (
                        <div className="mt-6 border-t border-slate-700 pt-4">
                            <button onClick={handleSave} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
                                Save All to Library
                            </button>
                        </div>
                     )}
                </div>
            )}
        </div>
    );
};

export default GrammarExplainer;