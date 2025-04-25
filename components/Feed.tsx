'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from 'next/image';

interface GitHubCommit {
    message: string;
    sha: string;
}

interface GitHubEvent {
    id: string;
    type: string;
    actor: {
        login: string;
        avatar_url: string;
    };
    repo: {
        name: string;
    };
    payload: {
        commits?: GitHubCommit[];
    };
    created_at: string;
}

interface GitHubUser {
    login: string;
    avatar_url: string;
    type: string;
}

function getEventStyles(type: string) {
    switch (type) {
        case 'PushEvent':
            return {
                bg: 'bg-blue-50 dark:bg-blue-950/50',
                border: 'border-blue-200 dark:border-blue-800',
                icon: '🚀',
                iconBg: 'bg-blue-100 dark:bg-blue-900/50'
            };
        case 'WatchEvent':
            return {
                bg: 'bg-yellow-50 dark:bg-yellow-950/50',
                border: 'border-yellow-200 dark:border-yellow-800',
                icon: '⭐',
                iconBg: 'bg-yellow-100 dark:bg-yellow-900/50'
            };
        case 'CreateEvent':
            return {
                bg: 'bg-green-50 dark:bg-green-950/50',
                border: 'border-green-200 dark:border-green-800',
                icon: '📂',
                iconBg: 'bg-green-100 dark:bg-green-900/50'
            };
        case 'ForkEvent':
            return {
                bg: 'bg-purple-50 dark:bg-purple-950/50',
                border: 'border-purple-200 dark:border-purple-800',
                icon: '🔱',
                iconBg: 'bg-purple-100 dark:bg-purple-900/50'
            };
        case 'IssueEvent':
        case 'IssuesEvent':
            return {
                bg: 'bg-red-50 dark:bg-red-950/50',
                border: 'border-red-200 dark:border-red-800',
                icon: '🎫',
                iconBg: 'bg-red-100 dark:bg-red-900/50'
            };
        case 'PullRequestEvent':
            return {
                bg: 'bg-indigo-50 dark:bg-indigo-950/50',
                border: 'border-indigo-200 dark:border-indigo-800',
                icon: '🔄',
                iconBg: 'bg-indigo-100 dark:bg-indigo-900/50'
            };
        default:
            return {
                bg: 'bg-gray-50 dark:bg-gray-800/50',
                border: 'border-gray-200 dark:border-gray-700',
                icon: '📌',
                iconBg: 'bg-gray-100 dark:bg-gray-800'
            };
    }
}

export default function Feed() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            window.location.href = '/';
        },
    });

    const [following, setFollowing] = useState<GitHubUser[]>([]);
    const [events, setEvents] = useState<GitHubEvent[]>([]);
    const [displayCount, setDisplayCount] = useState(20);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        if (!session?.accessToken || status !== 'authenticated') {
            return;
        }

        const accessToken = session.accessToken;

        async function fetchData() {
            try {
                const followingRes = await fetch('https://api.github.com/user/following', {
                    headers: {
                        'Authorization': `token ${accessToken}`,
                        'Accept': 'application/vnd.github.v3+json',
                    }
                });

                if (!followingRes.ok) {
                    throw new Error('Failed to fetch following users');
                }

                const followingData = await followingRes.json();
                if (!mounted) return;
                console.log('Following data:', followingData[7]);
                setFollowing(followingData);

                const eventsPromises = followingData.map((user: GitHubUser) =>
                    fetch(`https://api.github.com/users/${user.login}/events`, {
                        headers: {
                            'Authorization': `token ${accessToken}`,
                            'Accept': 'application/vnd.github.v3+json',
                        }
                    }).then(res => {
                        if (!res.ok) {
                            console.warn(`Failed to fetch events for ${user.login}`);
                            return [];
                        }
                        return res.json();
                    })
                );

                const allEvents = await Promise.all(eventsPromises);
                if (!mounted) return;

                const flatEvents = allEvents.flat();
                const sortedEvents = flatEvents.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                );

                setEvents(sortedEvents);
            } catch (err) {
                if (mounted) {
                    setError(err instanceof Error ? err.message : 'Failed to fetch data');
                    console.error('Error fetching data:', err);
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                }
            }
        }

        fetchData();

        return () => {
            mounted = false;
        };
    }, [session, status]);

    const loadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => prev + 20);
            setLoadingMore(false);
        }, 500); // Add a small delay for better UX
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="relative">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <div className="text-red-500 mb-4">Error: {error}</div>
                <button
                    onClick={() => signOut()}
                    className="px-6 py-3 bg-[#24292F] text-white rounded-lg hover:bg-gray-800"
                >
                    Sign out and try again
                </button>
            </div>
        );
    }

    function formatEvent(event: GitHubEvent): string {
        switch (event.type) {
            case 'PushEvent':
                const commits = event.payload.commits?.length || 0;
                return `🚀 pushed ${commits} commit${commits === 1 ? '' : 's'} to`;
            case 'WatchEvent':
                return '⭐ starred';
            case 'CreateEvent':
                return '📂 created';
            case 'ForkEvent':
                return '🔱 forked';
            case 'IssueEvent':
            case 'IssuesEvent':
                return '🎫 opened an issue in';
            case 'PullRequestEvent':
                return '🔄 opened a pull request in';
            default:
                return 'interacted with';
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-24">
            <div className="mb-8">
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
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 dark:from-green-500 dark:to-emerald-600 rounded-full border-2 border-white dark:border-gray-900 animate-pulse shadow-lg"></div>
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

                            {/* Card effects */}
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 backdrop-blur-3xl"></div>
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div className="absolute -inset-px bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500 group-hover:duration-200"></div>

                            {/* Interactive corner decorations */}
                            <div className="absolute top-0 left-0 w-16 h-16 -translate-x-full -translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 bg-gradient-to-br from-blue-500/10 to-transparent transition-transform duration-500"></div>
                            <div className="absolute bottom-0 right-0 w-16 h-16 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 bg-gradient-to-tl from-indigo-500/10 to-transparent transition-transform duration-500"></div>
                        </a>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Activity Feed
                </h2>
                <div className="space-y-4">
                    {events.slice(0, displayCount).map(event => {
                        const styles = getEventStyles(event.type);
                        return (
                            <div
                                key={event.id}
                                className={`p-4 rounded-lg border ${styles.border} ${styles.bg} hover:shadow-md dark:hover:shadow-gray-950 transition-all duration-200 animate-fade-in`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`${styles.iconBg} p-2 rounded-full flex-shrink-0`}>
                                        <span className="text-xl">{styles.icon}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Image
                                                src={event.actor.avatar_url}
                                                alt={event.actor.login}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 rounded-full"
                                            />
                                            <a
                                                href={`https://github.com/${event.actor.login}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                {event.actor.login}
                                            </a>
                                        </div>
                                        <div className="mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">{formatEvent(event)}</span>
                                            {' '}
                                            <a
                                                href={`https://github.com/${event.repo.name}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                {event.repo.name}
                                            </a>
                                        </div>
                                        {event.type === 'PushEvent' && event.payload.commits && (
                                            <div className="mt-2 space-y-1">
                                                {event.payload.commits.slice(0, 3).map((commit: GitHubCommit, index: number) => (
                                                    <div key={index} className="text-sm text-gray-600 dark:text-gray-400 pl-4 border-l-2 border-gray-300 dark:border-gray-600">
                                                        {commit.message.split('\n')[0]}
                                                    </div>
                                                ))}
                                                {event.payload.commits.length > 3 && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-500 pl-4">
                                                        +{event.payload.commits.length - 3} more commits
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                            {new Date(event.created_at).toLocaleDateString('en-US', {
                                                hour: 'numeric',
                                                minute: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {events.length > displayCount && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={loadMore}
                            disabled={loadingMore}
                            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-500 dark:hover:to-indigo-500 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loadingMore ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    View More
                                    <span className="text-sm opacity-75">
                                        ({events.length - displayCount} more)
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}