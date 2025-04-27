'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import Image from 'next/image';
import Following from './Following';
import { GitHubService, type GitHubEvent, type GitHubUser, type UserContribution } from '../services/github';

type TabType = 'feed' | 'streaks' | 'digest';

// Moved styles helper to a separate object for better maintainability
const EVENT_STYLES = {
    PushEvent: {
        bg: 'bg-blue-50 dark:bg-blue-950/50',
        border: 'border-blue-200 dark:border-blue-800',
        icon: '🚀',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50'
    },
    WatchEvent: {
        bg: 'bg-yellow-50 dark:bg-yellow-950/50',
        border: 'border-yellow-200 dark:border-yellow-800',
        icon: '⭐',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/50'
    },
    CreateEvent: {
        bg: 'bg-green-50 dark:bg-green-950/50',
        border: 'border-green-200 dark:border-green-800',
        icon: '📂',
        iconBg: 'bg-green-100 dark:bg-green-900/50'
    },
    ForkEvent: {
        bg: 'bg-purple-50 dark:bg-purple-950/50',
        border: 'border-purple-200 dark:border-purple-800',
        icon: '🔱',
        iconBg: 'bg-purple-100 dark:bg-purple-900/50'
    },
    IssuesEvent: {
        bg: 'bg-red-50 dark:bg-red-950/50',
        border: 'border-red-200 dark:border-red-800',
        icon: '🎫',
        iconBg: 'bg-red-100 dark:bg-red-900/50'
    },
    PullRequestEvent: {
        bg: 'bg-indigo-50 dark:bg-indigo-950/50',
        border: 'border-indigo-200 dark:border-indigo-800',
        icon: '🔄',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/50'
    },
    default: {
        bg: 'bg-gray-50 dark:bg-gray-800/50',
        border: 'border-gray-200 dark:border-gray-700',
        icon: '📌',
        iconBg: 'bg-gray-100 dark:bg-gray-800'
    }
} as const;

export default function Feed() {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            window.location.href = '/';
        },
    });

    const [activeTab, setActiveTab] = useState<TabType>('feed');
    const [following, setFollowing] = useState<GitHubUser[]>([]);
    const [events, setEvents] = useState<GitHubEvent[]>([]);
    const [contributions, setContributions] = useState<UserContribution[]>([]);
    const [displayCount, setDisplayCount] = useState(20);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError,] = useState<string | null>(null);

    // Initialize GitHub service with memoization
    const githubService = useMemo(() => {
        if (!session?.accessToken) return null;
        return new GitHubService(session.accessToken);
    }, [session?.accessToken]);

    // Fetch data using the GitHub service
    const fetchData = useCallback(async () => {
        if (!githubService) return;

        try {
            // Get following users
            const followingData = await githubService.getFollowing();
            setFollowing(followingData);

            // Get events and contributions in parallel
            const [eventsData, contributionsData] = await Promise.all([
                githubService.getMultipleUsersEvents(followingData),
                githubService.getAllUserContributions(followingData)
            ]);

            setEvents(eventsData);
            setContributions(contributionsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [githubService]);

    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status, fetchData]);

    const getEventStyles = (type: string) => {
        return EVENT_STYLES[type as keyof typeof EVENT_STYLES] || EVENT_STYLES.default;
    };

    const formatEvent = (event: GitHubEvent): string => {
        switch (event.type) {
            case 'PushEvent':
                const commits = event.payload.commits?.length || 0;
                return `pushed ${commits} commit${commits === 1 ? '' : 's'} to`;
            case 'WatchEvent':
                return 'starred';
            case 'CreateEvent':
                return 'created';
            case 'ForkEvent':
                return 'forked';
            case 'IssuesEvent':
                return 'opened an issue in';
            case 'PullRequestEvent':
                return 'opened a pull request in';
            default:
                return 'interacted with';
        }
    };

    const loadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => prev + 20);
            setLoadingMore(false);
        }, 500);
    };

    // Memoized calculations for the digest tab
    const todaysSummary = useMemo(() => {
        if (!githubService || !events.length) return null;
        const today = new Date().toISOString().split('T')[0];
        return githubService.getActivitySummary(events, today);
    }, [githubService, events]);

    const topContributor = useMemo(() => {
        if (!contributions.length) return null;
        return contributions.reduce((prev, current) =>
            (current.currentStreak > prev.currentStreak) ? current : prev
        );
    }, [contributions]);

    // Common loading state component
    if (status === 'loading' || loading) {
        return (
            <div className="flex flex-col justify-center items-center h-64 relative">
                {/* Outer glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 rounded-full blur-3xl animate-glow"></div>

                {/* Primary spinner */}
                <div className="relative w-24 h-24">
                    {/* Spinning rings */}
                    <div className="absolute inset-0 rounded-full border-8 border-blue-500/30 border-t-blue-500 animate-spin"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-indigo-500/30 border-r-indigo-500 animate-spin-slow"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-purple-500/30 border-b-purple-500 animate-spin-slower"></div>

                    {/* Pulsing center */}
                    <div className="absolute inset-[12px] rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 animate-pulse shadow-lg"></div>

                    {/* Shimmering overlay */}
                    <div className="absolute inset-[12px] rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>

                {/* Background effects */}
                <div className="absolute w-40 h-40 bg-blue-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute w-32 h-32 bg-indigo-500/10 rounded-full blur-xl animate-glow"></div>
                <div className="absolute w-24 h-24 bg-purple-500/10 rounded-full blur-lg animate-pulse"></div>

                {/* Loading text */}
                <div className="mt-12 text-base font-medium bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent animate-pulse">
                    Loading your GitHub feed...
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

    return (
        <div className="max-w-4xl mx-auto pb-24">
            {/* Tab Navigation */}
            <div className="sticky top-16 z-40 py-4 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex justify-center">
                    <div className="inline-flex rounded-lg border border-gray-100 dark:border-gray-800 p-1 bg-white dark:bg-gray-900 shadow-sm">
                        {(['feed', 'streaks', 'digest'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab === 'feed' && '📱 Feed'}
                                {tab === 'streaks' && '🔥 Streaks'}
                                {tab === 'digest' && '📊 Daily Digest'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'feed' && (
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
                                                    {event.payload.commits.slice(0, 3).map((commit, index) => (
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
            )}

            {activeTab === 'streaks' && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                        Contribution Streaks 🔥
                    </h2>
                    <div className="grid gap-6 md:grid-cols-2">
                        {contributions
                            .sort((a, b) => b.currentStreak - a.currentStreak)
                            .map((contribution) => (
                                <div
                                    key={contribution.user.login}
                                    className="p-6 rounded-lg border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/30 hover:shadow-lg transition-all duration-200"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <Image
                                            src={contribution.user.avatar_url}
                                            alt={contribution.user.login}
                                            width={40}
                                            height={40}
                                            className="rounded-full"
                                        />
                                        <div>
                                            <a
                                                href={`https://github.com/${contribution.user.login}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold hover:text-blue-600 dark:hover:text-blue-400"
                                            >
                                                {contribution.user.login}
                                            </a>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {contribution.currentStreak} day{contribution.currentStreak !== 1 ? 's' : ''} streak
                                            </div>
                                            {contribution.currentStreak >= 3 && (
                                                <div className="ml-auto">
                                                    <div className="text-2xl animate-bounce">🔥</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600 dark:text-gray-400">
                                                Total Contributions (30d)
                                            </span>
                                            <span className="font-semibold">
                                                {contribution.contributionCount}
                                            </span>
                                        </div>
                                        <div className="h-2 bg-orange-100 dark:bg-orange-900 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                                                style={{
                                                    width: `${Math.min((contribution.currentStreak / 7) * 100, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                                            {contribution.currentStreak}/7 days
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {activeTab === 'digest' && (
                <div>
                    <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                        Daily Digest 📊
                    </h2>

                    {/* Today's Top Contributor */}
                    {topContributor && (
                        <div className="mb-8 p-6 rounded-lg border border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30">
                            <h3 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-300">
                                🏆 Today&apos;s Top Contributor
                            </h3>
                            <div className="flex items-center gap-4">
                                <Image
                                    src={topContributor.user.avatar_url}
                                    alt={topContributor.user.login}
                                    width={48}
                                    height={48}
                                    className="rounded-full ring-4 ring-green-400 dark:ring-green-500"
                                />
                                <div>
                                    <a
                                        href={`https://github.com/${topContributor.user.login}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-semibold hover:text-blue-600 dark:hover:text-blue-400"
                                    >
                                        {topContributor.user.login}
                                    </a>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">
                                        {topContributor.contributionCount} contributions in the last 30 days
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-400">
                                        🔥 {topContributor.currentStreak} day streak!
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Today's Activity Summary */}
                    {todaysSummary && (
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="p-6 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
                                <h3 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-300">
                                    📱 Today&apos;s Activity
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>🚀 Pushes</span>
                                        <span className="font-semibold">{todaysSummary.commits}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>⭐ Stars</span>
                                        <span className="font-semibold">{todaysSummary.stars}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>🔄 Pull Requests</span>
                                        <span className="font-semibold">{todaysSummary.prs}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>🎫 Issues</span>
                                        <span className="font-semibold">{todaysSummary.issues}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30">
                                <h3 className="text-lg font-semibold mb-4 text-purple-700 dark:text-purple-300">
                                    ⚡ Quick Stats
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span>👥 Following</span>
                                        <span className="font-semibold">{following.length}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>🔥 Active Streaks</span>
                                        <span className="font-semibold">
                                            {contributions.filter(c => c.currentStreak > 0).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>📊 Avg. Daily Activity</span>
                                        <span className="font-semibold">
                                            {Math.round(events.length / 30)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <Following following={following} />
        </div>
    );
}