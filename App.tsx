import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import GrammarExplainer from './components/GrammarExplainer';
import VocabularyExplainer from './components/VocabularyExplainer';
import Library from './components/Library';
import Login from './components/Login';
import { View, GrammarEntry, VocabularyEntry, User } from './types';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState<View>('grammar');
    const [grammarLibrary, setGrammarLibrary] = useState<GrammarEntry[]>([]);
    const [vocabularyLibrary, setVocabularyLibrary] = useState<VocabularyEntry[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

    // Check for logged-in user on initial mount
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            } else {
                setIsDataLoaded(true); // No user, so data loading is "done"
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            setIsDataLoaded(true);
        }
    }, []);

    // Load user data when currentUser changes
    useEffect(() => {
        if (!currentUser) {
            setGrammarLibrary([]);
            setVocabularyLibrary([]);
            return;
        }
        setIsDataLoaded(false);
        try {
            const userData = localStorage.getItem(`userData_${currentUser.username}`);
            if (userData) {
                const { grammarLibrary: storedGrammar, vocabularyLibrary: storedVocab } = JSON.parse(userData);
                setGrammarLibrary(storedGrammar || []);
                setVocabularyLibrary(storedVocab || []);
            } else {
                // First time login for this user
                setGrammarLibrary([]);
                setVocabularyLibrary([]);
            }
        } catch (error) {
            console.error("Failed to load user data from localStorage", error);
            setGrammarLibrary([]);
            setVocabularyLibrary([]);
        } finally {
            setIsDataLoaded(true);
        }
    }, [currentUser]);

    // Effect to automatically save data to localStorage whenever the libraries change
    useEffect(() => {
        if (currentUser && isDataLoaded) {
            try {
                const dataToStore = {
                    grammarLibrary: grammarLibrary,
                    vocabularyLibrary: vocabularyLibrary,
                };
                localStorage.setItem(`userData_${currentUser.username}`, JSON.stringify(dataToStore));
            } catch (error) {
                console.error("Failed to save user data to localStorage", error);
            }
        }
    }, [grammarLibrary, vocabularyLibrary, currentUser, isDataLoaded]);

    const handleLogin = useCallback((username: string) => {
        const user: User = { username };
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setActiveView('grammar'); // Reset to default view on login
    }, []);

    const handleLogout = useCallback(() => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    }, []);

    const addToGrammarLibrary = useCallback((entry: Omit<GrammarEntry, 'id' | 'timestamp'>) => {
        setGrammarLibrary(prev => {
            const newEntry: GrammarEntry = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
            const updatedLibrary = [newEntry, ...prev.filter(item => item.source !== entry.source)];
            return updatedLibrary;
        });
    }, []);

    const addToVocabularyLibrary = useCallback((entry: Omit<VocabularyEntry, 'id' | 'timestamp'>) => {
        setVocabularyLibrary(prev => {
            const newEntry: VocabularyEntry = { ...entry, id: Date.now().toString(), timestamp: Date.now() };
            const updatedLibrary = [newEntry, ...prev.filter(item => item.word !== entry.word)];
            return updatedLibrary;
        });
    }, []);
    
    const deleteGrammarEntry = useCallback((id: string) => {
        setGrammarLibrary(prev => prev.filter(item => item.id !== id));
    }, []);

    const deleteVocabularyEntry = useCallback((id: string) => {
        setVocabularyLibrary(prev => prev.filter(item => item.id !== id));
    }, []);

    const onGrammarReorder = useCallback((reorderedList: GrammarEntry[]) => {
        setGrammarLibrary(reorderedList);
    }, []);

    const onVocabularyReorder = useCallback((reorderedList: VocabularyEntry[]) => {
        setVocabularyLibrary(reorderedList);
    }, []);


    const renderContent = () => {
        switch (activeView) {
            case 'grammar':
                return <GrammarExplainer onAddToLibrary={addToGrammarLibrary} />;
            case 'vocabulary':
                return <VocabularyExplainer 
                            onAddToLibrary={addToVocabularyLibrary} 
                            vocabularyEntries={vocabularyLibrary} 
                        />;
            case 'library':
                return <Library 
                            grammarEntries={grammarLibrary} 
                            vocabularyEntries={vocabularyLibrary}
                            onDeleteGrammar={deleteGrammarEntry}
                            onDeleteVocabulary={deleteVocabularyEntry}
                            onReorderGrammar={onGrammarReorder}
                            onReorderVocabulary={onVocabularyReorder}
                        />;
            default:
                return <GrammarExplainer onAddToLibrary={addToGrammarLibrary} />;
        }
    };
    
    if (!isDataLoaded) {
        // Show a loading spinner while checking for user/loading data
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-900">
                <svg className="animate-spin h-10 w-10 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
        )
    }

    if (!currentUser) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
            <Header 
                activeView={activeView} 
                setActiveView={setActiveView} 
                currentUser={currentUser}
                onLogout={handleLogout}
            />
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