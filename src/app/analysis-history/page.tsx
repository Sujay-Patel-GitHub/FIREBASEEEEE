'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { History, Leaf, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { AnalysisResult } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AnalysisHistoryPage() {
    const { userId } = useAuth();
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const q = query(
                    collection(db, 'analyses'), 
                    where('userId', '==', userId),
                    orderBy('analyzedAt', 'desc')
                );
                const querySnapshot = await getDocs(q);
                const historyData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        analyzedAt: data.analyzedAt.toDate(), // Convert Firestore Timestamp to Date
                    } as AnalysisResult;
                });
                setHistory(historyData);
            } catch (err) {
                console.error("Error fetching history: ", err);
                setError("Failed to load analysis history. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userId]);

    if (loading) {
        return (
             <div className="container mx-auto py-8">
                <h1 className="text-3xl font-bold mb-6">Analysis History</h1>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-40 w-full rounded-md" />
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                                <Skeleton className="h-4 w-1/4" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }
    
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">Analysis History</h1>
            
            {error && (
                 <Card className="bg-destructive/10 border-destructive">
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <AlertTriangle className="h-8 w-8 text-destructive" />
                            <div>
                                <CardTitle className="text-destructive">Error Loading History</CardTitle>
                                <CardDescription className="text-destructive/80">{error}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </Card>
            )}

            {!error && history.length === 0 && (
                 <Card>
                    <CardHeader>
                        <CardTitle>No History Found</CardTitle>
                        <CardDescription>You have not performed any analyses yet.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center text-muted-foreground py-12">
                            <History className="mx-auto h-12 w-12" />
                            <p className="mt-4">Upload a plant leaf on the dashboard to start your first analysis.</p>
                             <Link href="/">
                               <Button variant="outline" className="mt-4">Go to Dashboard</Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            )}

            {!error && history.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {history.map(item => (
                        <Card key={item.id} className="overflow-hidden flex flex-col">
                            <div className="relative aspect-video">
                                <Image src={item.imageUrl} alt={`Analysis of ${item.plantSpecies}`} layout="fill" objectFit="cover" />
                            </div>
                            <CardHeader>
                                <CardTitle className="truncate">{item.plantSpecies}</CardTitle>
                                <CardDescription>
                                    Analyzed on {new Date(item.analyzedAt).toLocaleDateString()}
                                </CardDescription>
                            </CardHeader>
                             <CardContent className="flex-grow">
                                <div className="flex items-center gap-2">
                                    <Leaf className="h-5 w-5 text-primary" />
                                    <p className="font-semibold">{item.diseaseDetection.name}</p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                 <Badge variant={item.severity.level === 'High' ? 'destructive' : item.severity.level === 'Medium' ? 'secondary' : 'default'}>
                                    Severity: {item.severity.level}
                                 </Badge>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
