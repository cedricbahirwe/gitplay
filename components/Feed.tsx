'use client';

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

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
    const [displayCount, setDisplayCount] = useState(50);
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
            setDisplayCount(prev => prev + 50);
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
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-400 dark:to-blue-400 bg-clip-text text-transparent">
                    Following ({following.length})
                </h2>
                <div className="overflow-x-auto pb-4 scrollbar-hide">
                    <div className="flex gap-3">
                        {following.map(user => (
                            <a
                                key={user.login}
                                href={`https://github.com/${user.login}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-all duration-200 group min-w-max"
                            >
                                <div className="relative">
                                    <img
                                        src={user.avatar_url}
                                        alt={user.login}
                                        className="w-8 h-8 rounded-full group-hover:ring-2 ring-blue-400 dark:ring-blue-500 transition-all duration-200"
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 dark:bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                                </div>
                                <span className="text-sm font-medium">{user.login}</span>
                            </a>
                        ))}
                    </div>
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
                                            <img
                                                src={event.actor.avatar_url}
                                                alt={event.actor.login}
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