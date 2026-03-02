'use client';

import { Button, Badge, Card, Input, Select, Skeleton, Container } from '@/components/ui';

/**
 * Interactive design system showcase.
 * Extracted into a Client Component so that onClick handlers on Card
 * are never serialized across the RSC boundary.
 */
export function DesignShowcase() {
    return (
        <Container className="py-12 space-y-12 animate-fade-in">
            <h1 className="text-3xl font-bold">🎨 Design System Showcase</h1>

            {/* Buttons */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground/60 uppercase tracking-widest text-xs">Buttons</h2>
                <div className="flex flex-wrap gap-3">
                    <Button variant="primary">Primary</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="primary" size="sm">Small</Button>
                    <Button variant="primary" size="lg">Large</Button>
                    <Button variant="primary" disabled>Disabled</Button>
                </div>
            </section>

            {/* Badges */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground/60 uppercase tracking-widest text-xs">Terrain Badges</h2>
                <div className="flex flex-wrap gap-3">
                    <Badge terrain="road" />
                    <Badge terrain="trail" />
                    <Badge terrain="ultra" />
                    <Badge terrain="cross" />
                </div>
            </section>

            {/* Cards */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground/60 uppercase tracking-widest text-xs">Cards</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card>
                        <p className="text-sm font-medium">Static Card</p>
                        <p className="text-xs text-foreground/50 mt-1">Glassmorphism surface</p>
                    </Card>
                    <Card onClick={() => { }}>
                        <p className="text-sm font-medium">Interactive Card</p>
                        <p className="text-xs text-foreground/50 mt-1">Hover for glow effect</p>
                    </Card>
                    <Card active>
                        <p className="text-sm font-medium">Active Card</p>
                        <p className="text-xs text-foreground/50 mt-1">Road-blue ring</p>
                    </Card>
                </div>
            </section>

            {/* Inputs */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground/60 uppercase tracking-widest text-xs">Form Elements</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                    <Input placeholder="Search events…" />
                    <Select>
                        <option>All provinces</option>
                        <option>Madrid</option>
                        <option>Barcelona</option>
                    </Select>
                </div>
            </section>

            {/* Skeletons */}
            <section className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground/60 uppercase tracking-widest text-xs">Skeleton Loaders</h2>
                <div className="space-y-2 max-w-sm">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-32 w-full mt-4" />
                </div>
            </section>
        </Container>
    );
}
