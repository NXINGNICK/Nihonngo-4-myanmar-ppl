
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GrammarExplainer from './components/GrammarExplainer';
import VocabularyExplainer from './components/VocabularyExplainer';
import Library from './components/Library';
import { View, GrammarEntry, VocabularyEntry } from './types';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<View>('grammar');
    const [grammarLibrary, setGrammarLibrary] = useState<GrammarEntry[]>([]);
    const [vocabularyLibrary, setVocabularyLibrary] = useState<VocabularyEntry[]>([]);

    useEffect(() => {
        try {
            const storedGrammar = localStorage.getItem('grammarLibrary');
            if (storedGrammar) {
                setGrammarLibrary(JSON.parse(storedGrammar));
            }
            const storedVocab = localStorage.getItem('vocabularyLibrary');
            if (storedVocab) {
                setVocabularyLibrary(JSON.parse(storedVocab));
            }
        } catch (error) {
            console.error("Failed to load from localStorage", error);
        }
    }, []);

    const addToGrammarLibrary = useCallback((entry: Omit<GrammarEntry, 'id' | 'timestamp'>) => {
        setGrammarLibrary(prev => {
            const newEntry: GrammarEntry = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
            const updatedLibrary = [newEntry, ...prev.filter(item => item.source !== entry.source)];
            localStorage.setItem('grammarLibrary', JSON.stringify(updatedLibrary));
            return updatedLibrary;
        });
    }, []);

    const addToVocabularyLibrary = useCallback((entry: Omit<VocabularyEntry, 'id' | 'timestamp'>) => {
        setVocabularyLibrary(prev => {
            const newEntry: VocabularyEntry = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
            const updatedLibrary = [newEntry, ...prev.filter(item => item.word !== entry.word)];
            localStorage.setItem('vocabularyLibrary', JSON.stringify(updatedLibrary));
            return updatedLibrary;
        });
    }, []);
    
    const deleteGrammarEntry = useCallback((id: string) => {
        setGrammarLibrary(prev => {
            const updatedLibrary = prev.filter(item => item.id !== id);
            localStorage.setItem('grammarLibrary', JSON.stringify(updatedLibrary));
            return updatedLibrary;
        });
    }, []);

    const deleteVocabularyEntry = useCallback((id: string) => {
        setVocabularyLibrary(prev => {
            const updatedLibrary = prev.filter(item => item.id !== id);
            localStorage.setItem('vocabularyLibrary', JSON.stringify(updatedLibrary));
            return updatedLibrary;
        });
    }, []);


    const renderContent = () => {
        switch (activeView) {
            case 'grammar':
                return <GrammarExplainer onAddToLibrary={addToGrammarLibrary} />;
            case 'vocabulary':
                return <VocabularyExplainer onAddToLibrary={addToVocabularyLibrary} />;
            case 'library':
                return <Library 
                            grammarEntries={grammarLibrary} 
                            vocabularyEntries={vocabularyLibrary}
                            onDeleteGrammar={deleteGrammarEntry}
                            onDeleteVocabulary={deleteVocabularyEntry}
                        />;
            default:
                return <GrammarExplainer onAddToLibrary={addToGrammarLibrary} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
            <Header activeView={activeView} setActiveView={setActiveView} />
            <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
                {renderContent()}
            </main>
            <footer className="text-center p-4 text-slate-500 text-sm">
                <p>Powered by Gemini. Made for Myanmar Students.</p>
            </footer>
        </div>
    );
};

export default App;
