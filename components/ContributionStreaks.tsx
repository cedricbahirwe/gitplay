import Image from 'next/image';
import { UserContribution } from '@/services/github';

interface Props {
    contributions: UserContribution[];
}

export default function ContributionStreaks({ contributions }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400 bg-clip-text text-transparent">
                Contribution Streaks
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
    );
}