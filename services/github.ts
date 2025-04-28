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

interface ContributionDay {
	contributionCount: number;
	date: string;
}

interface UserContribution {
	user: GitHubUser;
	contributionCount: number;
	currentStreak: number;
	contributions: ContributionDay[];
}

interface PaginatedResponse<T> {
	items: T[];
	hasNextPage: boolean;
	nextPage: number;
}

export class GitHubService {
	private accessToken: string;
	private baseUrl = "https://api.github.com";

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	private async fetch(endpoint: string): Promise<Response> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			headers: {
				Authorization: `token ${this.accessToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		});

		if (!response.ok) {
			const errorBody = await response.text();
			let errorMessage = `GitHub API error: ${response.status}`;

			if (response.status === 403) {
				errorMessage =
					"GitHub API rate limit exceeded or insufficient permissions. Please try again later.";
			} else if (response.status === 401) {
				errorMessage =
					"GitHub authentication failed. Please sign out and sign in again.";
			}

			throw new Error(`${errorMessage}\n${errorBody}`);
		}

		return response;
	}

	private parseLinkHeader(linkHeader: string | null): { next?: string } {
		if (!linkHeader) return {};

		const links = linkHeader.split(",");
		const parsedLinks: { [key: string]: string } = {};

		links.forEach((link) => {
			const [url, rel] = link.split(";");
			const urlMatch = url.match(/<(.+?)>/);
			const relMatch = rel.match(/rel="(.+?)"/);

			if (urlMatch && relMatch) {
				parsedLinks[relMatch[1]] = urlMatch[1];
			}
		});

		return {
			next: parsedLinks["next"],
		};
	}

	async getFollowingPaginated(
		page: number = 1,
		perPage: number = 20
	): Promise<PaginatedResponse<GitHubUser>> {
		const response = await this.fetch(
			`/user/following?page=${page}&per_page=${perPage}`
		);
		const data = (await response.json()) as GitHubUser[];
		const linkHeader = this.parseLinkHeader(response.headers.get("Link"));

		return {
			items: data,
			hasNextPage: !!linkHeader.next,
			nextPage: page + 1,
		};
	}

	async getFollowing(): Promise<GitHubUser[]> {
		const allFollowing: GitHubUser[] = [];
		let currentPage = 1;

		while (true) {
			const response = await this.getFollowingPaginated(currentPage, 100);
			allFollowing.push(...response.items);

			if (!response.hasNextPage) {
				break;
			}
			currentPage = response.nextPage;
		}

		return allFollowing;
	}

	async getUserEvents(user: GitHubUser): Promise<GitHubEvent[]> {
		const pathName = user.type === "User" ? "users" : "orgs";
		const response = await this.fetch(`/${pathName}/${user.login}/events`);
		return response.json();
	}

	async getMultipleUsersEvents(users: GitHubUser[]): Promise<GitHubEvent[]> {
		const allEvents = await Promise.all(
			users.map((user) => this.getUserEvents(user))
		);

		return allEvents
			.flat()
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime()
			);
	}

	async getUserContributions(
		user: GitHubUser,
		daysBack: number = 30
	): Promise<UserContribution> {
		const events = await this.getUserEvents(user);
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - daysBack);

		const contributions = events
			.filter(
				(event) =>
					new Date(event.created_at) >= startDate &&
					event.type === "PushEvent"
			)
			.reduce((acc: ContributionDay[], event) => {
				const date = event.created_at.split("T")[0];
				const existing = acc.find((d) => d.date === date);
				if (existing) {
					existing.contributionCount +=
						event.payload.commits?.length || 0;
				} else {
					acc.push({
						date,
						contributionCount: event.payload.commits?.length || 0,
					});
				}
				return acc;
			}, []);

		const currentStreak = this.calculateStreak(contributions);
		const totalContributions = contributions.reduce(
			(sum, day) => sum + day.contributionCount,
			0
		);

		return {
			user,
			contributionCount: totalContributions,
			currentStreak,
			contributions,
		};
	}

	async getAllUserContributions(
		users: GitHubUser[]
	): Promise<UserContribution[]> {
		return Promise.all(
			users.map((user) => this.getUserContributions(user))
		);
	}

	private calculateStreak(contributions: ContributionDay[]): number {
		let streak = 0;
		const today = new Date().toISOString().split("T")[0];
		const sortedDays = [...contributions].sort(
			(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
		);

		for (let i = 0; i < sortedDays.length; i++) {
			const currentDate = new Date(sortedDays[i].date);
			const expectedDate = new Date(today);
			expectedDate.setDate(expectedDate.getDate() - i);

			if (
				currentDate.toISOString().split("T")[0] ===
					expectedDate.toISOString().split("T")[0] &&
				sortedDays[i].contributionCount > 0
			) {
				streak++;
			} else {
				break;
			}
		}

		return streak;
	}

	getActivitySummary(
		events: GitHubEvent[],
		date: string
	): {
		commits: number;
		stars: number;
		prs: number;
		issues: number;
	} {
		const dayEvents = events.filter(
			(event) => event.created_at.split("T")[0] === date
		);

		return {
			commits: dayEvents.filter((e) => e.type === "PushEvent").length,
			stars: dayEvents.filter((e) => e.type === "WatchEvent").length,
			prs: dayEvents.filter((e) => e.type === "PullRequestEvent").length,
			issues: dayEvents.filter((e) => e.type === "IssuesEvent").length,
		};
	}
}

// Re-export interfaces for use in other files
export type {
	GitHubCommit,
	GitHubEvent,
	GitHubUser,
	ContributionDay,
	UserContribution,
	PaginatedResponse,
};
