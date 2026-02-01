
import React from 'react';
import Icon from './Icon';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
    const { user, signInWithGoogle, logout } = useAuth();

    return (
        <div className="absolute top-0 right-0 z-10 flex items-center justify-end p-6 w-full pointer-events-none">
            <div className="flex items-center gap-8 pointer-events-auto">
                <nav className="flex items-center gap-6">
                    <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Prohibited goods</a>
                    <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Partners</a>
                    <a href="#" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">Contact</a>
                </nav>
                
                <div className="flex items-center gap-3 pl-6 border-l border-zinc-800">
                    <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <Icon name="sun" className="w-5 h-5" />
                    </button>
                    <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors">
                        <Icon name="bell" className="w-5 h-5" />
                    </button>
                    
                    {user ? (
                        <div className="flex items-center gap-2 group relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-0.5 cursor-pointer" onClick={() => logout()} title="Click to Logout">
                                <img 
                                    src={user.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&q=80"} 
                                    alt="Profile" 
                                    className="w-full h-full rounded-full object-cover border-2 border-black"
                                />
                            </div>
                        </div>
                    ) : (
                        <button 
                            onClick={() => signInWithGoogle()}
                            className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-widest transition-colors"
                        >
                            Sign In
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Header;
