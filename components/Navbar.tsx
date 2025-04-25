'use client';

import { signOut } from 'next-auth/react';

export default function Navbar() {
    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-100">
            <div className="max-w-4xl mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        GitPlay
                    </h1>
                    <button
                        onClick={() => signOut()}
                        className="px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-lg hover:from-gray-900 hover:to-black transition-all duration-200 text-sm font-medium"
                    >
                        Sign out
                    </button>
                </div>
            </div>
        </nav>
    );
}