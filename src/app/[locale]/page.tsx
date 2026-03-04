import { setRequestLocale } from 'next-intl/server';
import { DesignShowcase } from '@/components/ui/DesignShowcase';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <DesignShowcase />;
}


