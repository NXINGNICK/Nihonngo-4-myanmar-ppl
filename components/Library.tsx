import React, { useState } from 'react';
import { GrammarEntry, VocabularyEntry } from '../types';

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


interface Tab {
    id: string;
    label: string;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabClick: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
    return (
        <div className="mb-6 border-b border-slate-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabClick(tab.id)}
                        className={`${
                            activeTab === tab.id
                                ? 'border-sky-500 text-sky-400'
                                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};


interface LibraryProps {
    grammarEntries: GrammarEntry[];
    vocabularyEntries: VocabularyEntry[];
    onDeleteGrammar: (id: string) => void;
    onDeleteVocabulary: (id: string) => void;
}

const LibraryCard: React.FC<{
    title: string;
    content: string;
    date: string;
    onDelete: () => void;
}> = ({ title, content, date, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 transition-all duration-300 animate-fade-in-up">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-sky-400 break-all">{title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{date}</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                     <button 
                        onClick={() => setIsExpanded(!isExpanded)} 
                        className="p-1 text-slate-400 hover:text-white transition-colors"
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                        {isExpanded ? 
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg> : 
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>}
                    </button>
                    <button 
                        onClick={onDelete} 
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Delete entry"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="mt-4 border-t border-slate-700 pt-4">
                    <div className="text-slate-300 whitespace-pre-wrap leading-relaxed font-mono">
                        <SimpleMarkdown text={content} />
                    </div>
                </div>
            )}
        </div>
    )
}

const Library: React.FC<LibraryProps> = ({ grammarEntries, vocabularyEntries, onDeleteGrammar, onDeleteVocabulary }) => {
    const [activeTab, setActiveTab] = useState('grammar');

    const TABS = [
        { id: 'grammar', label: `Grammar (${grammarEntries.length})` },
        { id: 'vocabulary', label: `Vocabulary (${vocabularyEntries.length})` },
    ];
    
    const sortedGrammarEntries = [...grammarEntries].sort((a, b) => b.timestamp - a.timestamp);
    const sortedVocabularyEntries = [...vocabularyEntries].sort((a, b) => b.timestamp - a.timestamp);

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-indigo-400 mb-6">Saved Library</h1>
            <Tabs tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />
            
            <div className="space-y-4">
                {activeTab === 'grammar' && (
                    sortedGrammarEntries.length > 0 ? (
                        sortedGrammarEntries.map(entry => (
                            <LibraryCard 
                                key={entry.id}
                                title={entry.source.length > 50 ? `${entry.source.substring(0, 50)}...` : entry.source}
                                content={entry.explanation}
                                date={new Date(entry.timestamp).toLocaleString()}
                                onDelete={() => onDeleteGrammar(entry.id)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-10">Your saved grammar explanations will appear here.</p>
                    )
                )}

                {activeTab === 'vocabulary' && (
                    sortedVocabularyEntries.length > 0 ? (
                        sortedVocabularyEntries.map(entry => (
                            <LibraryCard
                                key={entry.id}
                                title={entry.word}
                                content={entry.explanation}
                                date={new Date(entry.timestamp).toLocaleString()}
                                onDelete={() => onDeleteVocabulary(entry.id)}
                            />
                        ))
                    ) : (
                        <p className="text-center text-slate-500 py-10">Your saved vocabulary explanations will appear here.</p>
                    )
                )}
            </div>
        </div>
    );
};

export default Library;
