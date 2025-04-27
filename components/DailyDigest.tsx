import Image from 'next/image';
import { GitHubEvent, UserContribution } from '@/services/github';

interface Props {
    topContributor: UserContribution | null;
    events: GitHubEvent[];
    todaysSummary: {
        commits: number;
        stars: number;
        prs: number;
        issues: number;
    } | null;
    totalFollowing: number;
}

export default function DailyDigest({ topContributor, events, todaysSummary, totalFollowing }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Daily Digest
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
                                <span className="font-semibold">{totalFollowing}</span>
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
    );
}