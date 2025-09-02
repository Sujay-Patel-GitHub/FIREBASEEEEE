
'use client';
import DashboardClient from '@/components/dashboard/dashboard-client';
import { useRef } from 'react';

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  return (
    <DashboardClient />
  );
}
