'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Role = 'user' | 'professional';

const roles: Array<{
    id: Role;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
}> = [
        {
            id: 'user',
            title: 'I need cleaning service',
            subtitle: 'Book trusted premium cleaning',
            description: 'For homeowners, tenants, Airbnb hosts, and offices looking for reliable cleaning support.',
            icon: (
                <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 11.5 12 4l9 7.5" />
                    <path d="M5 10.5V21h14V10.5" />
                    <path d="M9 21v-6h6v6" />
                </svg>
            ),
        },
        {
            id: 'professional',
            title: 'I am a cleaning professional',
            subtitle: 'Join SoHo Cleaning Group',
            description: 'For experienced cleaners and teams who want to work with a premium NYC cleaning brand.',
            icon: (
                <svg viewBox="0 0 24 24" className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M10 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
                    <path d="M2 20a7 7 0 0 1 12.6-4.2" />
                    <path d="M16 14h5v7h-5z" />
                    <path d="M17.5 14v-1.5a1.5 1.5 0 0 1 3 0V14" />
                </svg>
            ),
        },
    ];

export default function OnboardingRoleSelectionPage() {
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);

    const nextHref = selectedRole === 'professional' ? '/onboarding/professional' : '/onboarding/user';

    return (
        <main className="min-h-screen bg-[#060606] text-white">
            <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(214,171,95,0.18),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(214,171,95,0.08),transparent_30%)]" />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#1b1408]/60 to-transparent" />

                <div className="relative z-10 w-full max-w-5xl">
                    <div className="mb-14 text-center">
                        <Link href="/" className="mx-auto mb-8 inline-flex justify-center">
                            <Image
                                src="/images/soho-logo-new.png"
                                alt="SoHo Cleaning Group"
                                width={320}
                                height={90}
                                priority
                                className="h-auto w-[260px] sm:w-[320px]"
                            />
                        </Link>

                        <p className="mb-4 text-xs font-medium uppercase tracking-[0.34em] text-[#b7924c]">Welcome to SoHo Cleaning Group</p>
                        <h1 className="font-serif text-4xl leading-tight text-white sm:text-6xl">Which best describes you?</h1>
                        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#d6d0c5]">
                            Choose your path so we can create the right onboarding experience for you.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-2">
                        {roles.map((role) => {
                            const isSelected = selectedRole === role.id;

                            return (
                                <label
                                    key={role.id}
                                    className={`group relative cursor-pointer rounded-[32px] border p-4 transition duration-300 sm:p-5 ${isSelected
                                            ? 'border-[#d6ab5f] bg-[#151008] shadow-[0_24px_80px_rgba(214,171,95,0.18)]'
                                            : 'border-[#2a2419] bg-[#0a0a0a] hover:-translate-y-1 hover:border-[#8f6b2f]'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="role"
                                        value={role.id}
                                        checked={isSelected}
                                        onChange={() => setSelectedRole(role.id)}
                                        className="peer sr-only"
                                    />

                                    <span
                                        className={`absolute right-6 top-6 flex h-7 w-7 items-center justify-center rounded-full border transition ${isSelected ? 'border-[#d6ab5f] bg-[#d6ab5f]' : 'border-[#6f6149] bg-transparent'
                                            }`}
                                    >
                                        {isSelected && <span className="h-3 w-3 rounded-full bg-black" />}
                                    </span>

                                    <div className="rounded-[26px] border border-[#2a2419] bg-[linear-gradient(135deg,rgba(214,171,95,0.22),rgba(255,255,255,0.03))] p-10 text-[#e3bd74] transition group-hover:border-[#8f6b2f] sm:p-14">
                                        <div className="flex min-h-40 items-center justify-center rounded-[24px] bg-black/25">
                                            {role.icon}
                                        </div>
                                    </div>

                                    <div className="px-2 pb-4 pt-7 text-center">
                                        <h2 className="font-serif text-3xl text-white">{role.title}</h2>
                                        <p className="mt-2 text-base font-medium text-[#d6ab5f]">{role.subtitle} →</p>
                                        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#cfc7b7]">{role.description}</p>
                                    </div>
                                </label>
                            );
                        })}
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-center gap-5">
                        <Link
                            href={selectedRole ? nextHref : '#'}
                            aria-disabled={!selectedRole}
                            className={`w-full max-w-sm rounded-2xl px-6 py-4 text-center text-base font-semibold transition sm:w-auto sm:min-w-64 ${selectedRole
                                    ? 'bg-[#d6ab5f] text-black hover:scale-[1.02]'
                                    : 'pointer-events-none bg-[#2a2419] text-[#7e7464]'
                                }`}
                        >
                            Continue
                        </Link>
                    </div>
                </div>
            </section>
        </main>
    );
}
