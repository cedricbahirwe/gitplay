export default function Footer() {
    return (
        <footer className="mt-12 py-6 border-t border-gray-100 dark:border-gray-800">
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