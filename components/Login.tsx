import React, { useState } from 'react';

interface LoginProps {
    onLogin: (username: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim()) {
            setIsLoading(true);
            // Simulate a network request
            setTimeout(() => {
                onLogin(username.trim());
                setIsLoading(false);
            }, 500);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-slate-800 rounded-2xl shadow-2xl animate-fade-in-up">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <svg className="h-12 w-12 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m4 16v-2m-4-1 4-4-4-4-4 4 4 4zm10-6v2m4-8v2m-4-1-4 4-4-4 4-4 4 4z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome to Nihongo Kyōshi</h1>
                    <p className="mt-2 text-slate-400">
                        Log in or sign up to sync your library across devices.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="username" className="sr-only">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            placeholder="Enter your username"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !username.trim()}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-500 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                "Login / Sign Up"
                            )}
                        </button>
                    </div>
                </form>
                <p className="mt-4 text-xs text-center text-slate-500">
                    Since this is a demo, no password is required. Your data is stored locally in your browser.
                </p>
            </div>
        </div>
    );
};

export default Login;
