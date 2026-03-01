import createNextIntlPlugin from 'next-intl/plugin';

// Explicitly point to the request config so next-intl finds it
// regardless of version-specific default lookup paths.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
