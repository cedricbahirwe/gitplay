'use client';

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession, signOut } from "next-auth/react";
import { GitHubService, type GitHubEvent, type GitHubUser, type UserContribution } from '../services/github';
import ActivityFeed from './ActivityFeed';
import ContributionStreaks from './ContributionStreaks';
import DailyDigest from './DailyDigest';
import Following from './Following';

type TabType = 'feed' | 'streaks' | 'digest' | 'following';

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
    const [error, setError] = useState<string | null>(null);
    const [currentFollowingPage, setCurrentFollowingPage] = useState(1);
    const [hasMoreFollowing, setHasMoreFollowing] = useState(true);
    const [loadingMoreFollowing, setLoadingMoreFollowing] = useState(false);

    // Initialize GitHub service with memoization
    const githubService = useMemo(() => {
        if (!session?.accessToken) return null;
        return new GitHubService(session.accessToken);
    }, [session?.accessToken]);

    // Fetch initial following data
    const fetchInitialFollowing = useCallback(async () => {
        if (!githubService) return;
        try {
            const response = await githubService.getFollowingPaginated(1);
            setFollowing(response.items);
            setHasMoreFollowing(response.hasNextPage);
            setCurrentFollowingPage(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch following');
        }
    }, [githubService]);

    // Fetch events and contributions
    const fetchEventsAndContributions = useCallback(async () => {
        if (!githubService || !following.length) return;

        try {
            const [eventsData, contributionsData] = await Promise.all([
                githubService.getMultipleUsersEvents(following),
                githubService.getAllUserContributions(following)
            ]);

            setEvents(eventsData);
            setContributions(contributionsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch events and contributions');
        }
    }, [githubService, following]);

    // Load more following
    const loadMoreFollowing = async () => {
        if (!githubService || !hasMoreFollowing || loadingMoreFollowing) return;

        setLoadingMoreFollowing(true);
        try {
            const response = await githubService.getFollowingPaginated(currentFollowingPage);
            setFollowing(prev => [...prev, ...response.items]);
            setHasMoreFollowing(response.hasNextPage);
            setCurrentFollowingPage(response.nextPage);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load more following');
        } finally {
            setLoadingMoreFollowing(false);
        }
    };

    // Initial data fetch
    const fetchData = useCallback(async () => {
        if (!githubService) return;

        try {
            await fetchInitialFollowing();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch data');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }, [githubService, fetchInitialFollowing]);

    // Effect to fetch initial data
    useEffect(() => {
        if (status === 'authenticated') {
            fetchData();
        }
    }, [status, fetchData]);

    // Effect to fetch events and contributions when following changes
    useEffect(() => {
        if (following.length > 0) {
            fetchEventsAndContributions();
        }
    }, [following, fetchEventsAndContributions]);

    const loadMore = () => {
        setLoadingMore(true);
        setTimeout(() => {
            setDisplayCount(prev => prev + 20);
            setLoadingMore(false);
        }, 500);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className="sticky top-[57px] z-40 py-4 mb-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <div className="flex justify-center">
                    <div className="inline-flex rounded-lg border border-gray-100 dark:border-gray-800 p-1 bg-white dark:bg-gray-900 shadow-sm">
                        {(['feed', 'streaks', 'digest', 'following'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => handleTabChange(tab)}
                                className={`px-6 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === tab
                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                    }`}
                            >
                                {tab === 'feed' && '📱 Feed'}
                                {tab === 'streaks' && '🔥 Streaks'}
                                {tab === 'digest' && '📊 Daily Digest'}
                                {tab === 'following' && '👥 Following'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'feed' && (
                <ActivityFeed
                    events={events}
                    displayCount={displayCount}
                    loadMore={loadMore}
                    loadingMore={loadingMore}
                />
            )}

            {activeTab === 'streaks' && (
                <ContributionStreaks contributions={contributions} />
            )}

            {activeTab === 'digest' && (
                <DailyDigest
                    topContributor={topContributor}
                    events={events}
                    todaysSummary={todaysSummary}
                    totalFollowing={following.length}
                />
            )}

            {activeTab === 'following' && (
                <Following
                    following={following}
                    hasMore={hasMoreFollowing}
                    loadMore={loadMoreFollowing}
                    loadingMore={loadingMoreFollowing}
                />
            )}
        </div>
    );
}