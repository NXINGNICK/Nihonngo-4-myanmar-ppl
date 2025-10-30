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
    onReorderGrammar: (entries: GrammarEntry[]) => void;
    onReorderVocabulary: (entries: VocabularyEntry[]) => void;
}

const LibraryCard: React.FC<{
    title: string;
    content: string;
    date: string;
    onDelete: () => void;
}> = ({ title, content, date, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-slate-800 rounded-lg shadow-lg p-4 transition-all duration-300 cursor-grab">
             <div className="flex justify-between items-start">
                <div>
                    <h3 className="font-bold text-sky-400 break-all">{title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{date}</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
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

const Library: React.FC<LibraryProps> = ({ grammarEntries, vocabularyEntries, onDeleteGrammar, onDeleteVocabulary, onReorderGrammar, onReorderVocabulary }) => {
    const [activeTab, setActiveTab] = useState('grammar');
    const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
    const [dropIndicator, setDropIndicator] = useState<{ index: number; position: 'top' | 'bottom' } | null>(null);

    const TABS = [
        { id: 'grammar', label: `Grammar (${grammarEntries.length})` },
        { id: 'vocabulary', label: `Vocabulary (${vocabularyEntries.length})` },
    ];
    
    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedItemId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id); // Required for Firefox
        document.body.classList.add('grabbing');
    };

    const handleDragEnd = () => {
        setDraggedItemId(null);
        setDropIndicator(null);
        document.body.classList.remove('grabbing');
    };
    
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemId === null) return;
        
        const currentEntries = activeTab === 'grammar' ? grammarEntries : vocabularyEntries;
        if (currentEntries[index]?.id === draggedItemId) {
            setDropIndicator(null);
            return;
        }

        const targetElement = e.currentTarget as HTMLElement;
        const rect = targetElement.getBoundingClientRect();
        const middleY = rect.top + rect.height / 2;
        const position = e.clientY < middleY ? 'top' : 'bottom';
        
        if (dropIndicator?.index !== index || dropIndicator?.position !== position) {
            setDropIndicator({ index, position });
        }
    };
    
    // Fix: Separated logic for grammar and vocabulary reordering to resolve TypeScript type errors.
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (!draggedItemId || dropIndicator === null) {
            handleDragEnd();
            return;
        }

        if (activeTab === 'grammar') {
            const entries = [...grammarEntries];
            const draggedIndex = entries.findIndex(item => item.id === draggedItemId);
            let targetIndex = dropIndicator.index;
            
            if (draggedIndex === -1 || draggedIndex === targetIndex) {
                handleDragEnd();
                return;
            }
            
            const [draggedItem] = entries.splice(draggedIndex, 1);
            
            if (draggedIndex < targetIndex) {
                targetIndex--;
            }

            if (dropIndicator.position === 'top') {
                entries.splice(targetIndex, 0, draggedItem);
            } else {
                entries.splice(targetIndex + 1, 0, draggedItem);
            }
            
            onReorderGrammar(entries);
        } else { // activeTab === 'vocabulary'
            const entries = [...vocabularyEntries];
            const draggedIndex = entries.findIndex(item => item.id === draggedItemId);
            let targetIndex = dropIndicator.index;
            
            if (draggedIndex === -1 || draggedIndex === targetIndex) {
                handleDragEnd();
                return;
            }
            
            const [draggedItem] = entries.splice(draggedIndex, 1);
            
            if (draggedIndex < targetIndex) {
                targetIndex--;
            }

            if (dropIndicator.position === 'top') {
                entries.splice(targetIndex, 0, draggedItem);
            } else {
                entries.splice(targetIndex + 1, 0, draggedItem);
            }
            
            onReorderVocabulary(entries);
        }
        
        handleDragEnd();
    };

    const currentEntries = activeTab === 'grammar' ? grammarEntries : vocabularyEntries;
    const currentOnDelete = activeTab === 'grammar' ? onDeleteGrammar : onDeleteVocabulary;

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-indigo-400 mb-6">Saved Library</h1>
            <Tabs tabs={TABS} activeTab={activeTab} onTabClick={setActiveTab} />
            
            <div 
                className="space-y-4"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onDragLeave={() => setDropIndicator(null)}
            >
                {currentEntries.length === 0 ? (
                    <p className="text-center text-slate-500 py-10">Your saved {activeTab} explanations will appear here.</p>
                ) : (
                    currentEntries.map((entry, index) => (
                       <div
                            key={entry.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, entry.id)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className="relative"
                        >
                            {dropIndicator?.index === index && dropIndicator?.position === 'top' && (
                                <div className="absolute -top-2 left-0 right-0 h-1.5 bg-sky-400 rounded-full z-10" />
                            )}
                            <div className={`transition-opacity duration-300 ${draggedItemId === entry.id ? 'opacity-30' : 'opacity-100'}`}>
                                <LibraryCard 
                                    title={'source' in entry ? (entry.source.length > 50 ? `${entry.source.substring(0, 50)}...` : entry.source) : entry.word}
                                    content={entry.explanation}
                                    date={new Date(entry.timestamp).toLocaleString()}
                                    onDelete={() => currentOnDelete(entry.id)}
                                />
                            </div>
                             {dropIndicator?.index === index && dropIndicator?.position === 'bottom' && (
                                <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-sky-400 rounded-full z-10" />
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Library;