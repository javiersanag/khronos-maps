import createNextIntlPlugin from 'next-intl/plugin';

// Explicitly point to the request config so next-intl finds it
// regardless of version-specific default lookup paths.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'rtsfiles.blob.core.windows.net',
                pathname: '/evento/**',
            },
        ],
    },
};

export default withNextIntl(nextConfig);
