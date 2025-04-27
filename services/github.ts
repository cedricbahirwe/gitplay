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

export class GitHubService {
	private accessToken: string;
	private baseUrl = "https://api.github.com";

	constructor(accessToken: string) {
		this.accessToken = accessToken;
	}

	private async fetch<T>(endpoint: string): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			headers: {
				Authorization: `token ${this.accessToken}`,
				Accept: "application/vnd.github.v3+json",
			},
		});

		if (!response.ok) {
			throw new Error(
				`GitHub API error: ${response.status} - ${response.statusText}`
			);
		}

		return response.json();
	}

	async getFollowing(): Promise<GitHubUser[]> {
		return this.fetch<GitHubUser[]>("/user/following");
	}

	async getUserEvents(username: string): Promise<GitHubEvent[]> {
		return this.fetch<GitHubEvent[]>(`/users/${username}/events`);
	}

	async getMultipleUsersEvents(usernames: string[]): Promise<GitHubEvent[]> {
		const allEvents = await Promise.all(
			usernames.map((username) => this.getUserEvents(username))
		);

		return allEvents
			.flat()
			.sort(
				(a, b) =>
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime()
			);
	}
}

// Re-export interfaces for use in other files
export type { GitHubCommit, GitHubEvent, GitHubUser };
