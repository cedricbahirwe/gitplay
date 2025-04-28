# GitHub Social

A modern social dashboard for GitHub that helps you stay connected with your network's development activities. Built with Next.js, TypeScript, and Tailwind CSS.

![GitHub Social Preview](.github/preview.png)

## Features

-   📱 **Activity Feed** - Real-time updates of GitHub activities from people you follow
-   🔥 **Contribution Streaks** - Track and compare coding streaks with your network
-   📊 **Daily Digest** - Get insights into your network's daily GitHub activities
-   👥 **Following Management** - Easily manage and view your GitHub following list
-   🎨 **Beautiful UI** - Modern, responsive design with dark mode support
-   🔒 **Secure Authentication** - GitHub OAuth integration

## Tech Stack

-   [Next.js 14](https://nextjs.org/) - React framework
-   [TypeScript](https://www.typescriptlang.org/) - Type safety
-   [Tailwind CSS](https://tailwindcss.com/) - Styling
-   [NextAuth.js](https://next-auth.js.org/) - Authentication
-   [GitHub API v3](https://docs.github.com/en/rest) - Data source

## Getting Started

### Prerequisites

-   Node.js 18.17 or later
-   A GitHub account
-   GitHub OAuth App credentials

### Setting up GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "OAuth Apps" in the sidebar
3. Click "New OAuth App"
4. Fill in the application details:
    - **Application name**: GitHub Social (or your preferred name)
    - **Homepage URL**: `http://localhost:3000`
    - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
5. Click "Register application"
6. You'll be provided with a Client ID
7. Click "Generate a new client secret"
8. Save both the Client ID and Client Secret - you'll need these for the next step

### Setup

1. Clone the repository:

```bash
git clone https://github.com/cedricbahirwe/githubsocial.git
cd githubsocial
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory:

```env
GITHUB_ID=your_github_client_id        # From GitHub OAuth App
GITHUB_SECRET=your_github_client_secret # From GitHub OAuth App
NEXTAUTH_SECRET=your_nextauth_secret    # Any random string (32+ characters)
NEXTAUTH_URL=http://localhost:3000
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Architecture

The project follows a component-based architecture:

-   `app/` - Next.js App Router pages and API routes
-   `components/` - React components
-   `services/` - API services and utilities
-   `types/` - TypeScript type definitions

## Features in Detail

### Activity Feed

-   Real-time GitHub activity updates
-   Support for various event types (Push, Star, Fork, etc.)
-   Infinite scrolling
-   Beautiful animations

### Contribution Streaks

-   Daily contribution tracking
-   Streak comparison
-   Visual progress indicators

### Daily Digest

-   Daily activity summary
-   Top contributor highlights
-   Network statistics

### Following Management

-   Paginated following list
-   Quick profile access
-   User type indicators

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
