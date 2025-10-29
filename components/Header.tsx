
import React from 'react';
import { View } from '../types';

interface HeaderProps {
    activeView: View;
    setActiveView: (view: View) => void;
}

const NavButton: React.FC<{
    label: string;
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}> = ({ label, isActive, onClick, children }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                isActive
                    ? 'bg-sky-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
            }`}
        >
            {children}
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
};

const Header: React.FC<HeaderProps> = ({ activeView, setActiveView }) => {
    return (
        <header className="bg-slate-800 shadow-md sticky top-0 z-10">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                       <svg className="h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 16v-2m-4-1 4-4-4-4-4 4 4 4zm10-6v2m4-8v2m-4-1-4 4-4-4 4-4 4 4z" />
                       </svg>
                        <span className="text-xl font-bold ml-2 text-white">Nihongo Kyōshi</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <NavButton
                            label="Grammar"
                            isActive={activeView === 'grammar'}
                            onClick={() => setActiveView('grammar')}
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h12"/></svg>
                        </NavButton>
                        <NavButton
                            label="Vocabulary"
                            isActive={activeView === 'vocabulary'}
                            onClick={() => setActiveView('vocabulary')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 5 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M12 5V2"/><path d="m19 12 2-2"/><path d="m5 12-2-2"/></svg>
                        </NavButton>
                        <NavButton
                            label="Library"
                            isActive={activeView === 'library'}
                            onClick={() => setActiveView('library')}
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        </NavButton>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;
