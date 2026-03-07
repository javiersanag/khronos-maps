'use client';

import { useState } from 'react';
import { MessageCircle, Twitter, Link as LinkIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ShareButtonsProps {
    url: string;
    title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    return (
        <div className="flex flex-wrap gap-2">
            <Button
                variant="secondary"
                size="sm"
                className="gap-2 shrink-0 border-slate-700 bg-slate-800/50 hover:bg-[#25D366]/20 hover:text-[#25D366] hover:border-[#25D366]/50 transition-colors"
                onClick={() => window.open(`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, '_blank')}
            >
                <MessageCircle size={16} />
                <span className="hidden sm:inline">WhatsApp</span>
            </Button>

            <Button
                variant="secondary"
                size="sm"
                className="gap-2 shrink-0 border-slate-700 bg-slate-800/50 hover:bg-[#1DA1F2]/20 hover:text-[#1DA1F2] hover:border-[#1DA1F2]/50 transition-colors"
                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, '_blank')}
            >
                <Twitter size={16} />
                <span className="hidden sm:inline">Twitter/X</span>
            </Button>

            <Button
                variant="secondary"
                size="sm"
                className="gap-2 shrink-0 border-slate-700 bg-slate-800/50 hover:bg-slate-700 transition-colors sm:w-28"
                onClick={handleCopy}
            >
                {copied ? <Check size={16} className="text-green-400" /> : <LinkIcon size={16} />}
                <span>{copied ? 'Copiado' : 'Copiar URL'}</span>
            </Button>
        </div>
    );
}
