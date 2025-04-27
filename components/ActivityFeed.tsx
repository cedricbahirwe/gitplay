import Image from 'next/image';
import { GitHubEvent } from '@/services/github';

interface Props {
    events: GitHubEvent[];
    displayCount: number;
    loadMore: () => void;
    loadingMore: boolean;
}

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

export default function ActivityFeed({ events, displayCount, loadMore, loadingMore }: Props) {
    return (
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
    );
}