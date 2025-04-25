export default function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 right-0 py-6 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Made with ❤️ by{' '}
                    <a
                        href="https://github.com/cedricbahirwe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-blue-600 hover:underline"
                    >
                        Cédric Bahirwe
                    </a>
                    {' © 2025'}
                </p>
            </div>
        </footer>
    );
}