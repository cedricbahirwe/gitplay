'use client';

import Image from 'next/image';

interface GitHubUser {
    login: string;
    avatar_url: string;
    type: string;
}

interface FollowingProps {
    following: GitHubUser[];
}

export default function Following({ following }: FollowingProps) {
    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-6 relative">
                <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 dark:from-indigo-400 dark:via-purple-400 dark:to-blue-400 bg-clip-text text-transparent animate-gradient-x">
                    Following ({following.length})
                </span>
                <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 rounded-full animate-shimmer"></div>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 p-4">
                {following.map((user, index) => (
                    <a
                        key={user.login}
                        href={`https://github.com/${user.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] animate-fade-up"
                        style={{
                            animationDelay: `${index * 100}ms`,
                            transform: 'perspective(1000px)'
                        }}
                    >
                        <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                            <div className="relative group-hover:rotate-6 transition-transform duration-500">
                                <div className="relative w-20 h-20 rounded-xl overflow-hidden ring-2 ring-transparent group-hover:ring-blue-500 transition-all duration-500 group-hover:rounded-[50%] transform group-hover:rotate-12">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                                    <Image
                                        src={user.avatar_url}
                                        alt={user.login}
                                        fill
                                        className="object-cover bg-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-12"
                                    />
                                </div>
                            </div>
                            <div className="transform transition-all duration-500 group-hover:translate-y-1">
                                <p className="font-semibold text-base truncate max-w-[140px] bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent group-hover:from-blue-600 group-hover:to-indigo-600 dark:group-hover:from-blue-400 dark:group-hover:to-indigo-400 transition-all duration-500">
                                    {user.login}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
                                    {user.type === 'User' ? 'GitHub Developer' : 'Organization'}
                                </p>
                            </div>
                        </div>

                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-3xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute -inset-px bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500 group-hover:duration-200"></div>

                        <div className="absolute top-0 left-0 w-16 h-16 -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 bg-gradient-to-br from-blue-500/10 to-transparent transition-transform duration-500"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 bg-gradient-to-tl from-indigo-500/10 to-transparent transition-transform duration-500"></div>
                    </a>
                ))}
            </div>
        </div>
    );
}