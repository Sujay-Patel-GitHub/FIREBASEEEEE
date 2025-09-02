
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History, Leaf } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import type { AnalysisResult } from "@/types";
import { Skeleton } from "../ui/skeleton";
import Image from "next/image";
import { Progress } from "../ui/progress";

export function AnalysisHistoryPreview() {
    const { userId, isGuest } = useAuth();
    const [history, setHistory] = useState<AnalysisResult[]>([]);
    const [loading, setLoading] = useState(true);

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
                    orderBy('analyzedAt', 'desc'),
                    limit(7)
                );
                const querySnapshot = await getDocs(q);
                const historyData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        analyzedAt: data.analyzedAt.toDate(),
                    } as AnalysisResult;
                });
                setHistory(historyData);
            } catch (err) {
                console.error("Error fetching history preview: ", err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [userId]);

    const renderSkeleton = () => (
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
            {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="aspect-video w-full rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
            ))}
        </div>
    );
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Recent Analysis</CardTitle>
                        <CardDescription>
                            {isGuest
                                ? "Sign in to save and view your analysis history."
                                : "A preview of your most recent analyses."}
                        </CardDescription>
                    </div>
                    {!isGuest && (
                        <Link href="/analysis-history">
                            <Button variant="outline">View All</Button>
                        </Link>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    renderSkeleton()
                ) : isGuest ? (
                    <div className="text-center text-muted-foreground py-8">
                        <History className="mx-auto h-12 w-12" />
                        <p className="mt-4">Your analysis history is not saved in guest mode.</p>
                        <Link href="/auth/signin">
                            <Button className="mt-4">Sign In to Save History</Button>
                        </Link>
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <History className="mx-auto h-12 w-12" />
                        <p className="mt-4">Perform an analysis to see the results here.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
                        {history.map(item => (
                            <div key={item.id} className="space-y-3">
                                <div className="overflow-hidden rounded-lg border">
                                    <div className="relative aspect-video">
                                        <Image src={item.imageUrl} alt={`Analysis of ${item.plantSpecies}`} layout="fill" objectFit="cover" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold truncate">{item.plantSpecies}</h3>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Leaf className="h-4 w-4 text-primary" /> {item.diseaseDetection.name}
                                    </p>
                                </div>
                                <div>
                                    <div className="flex justify-between items-baseline mb-1">
                                        <p className="text-xs font-medium text-muted-foreground">Detection Accuracy</p>
                                        <p className="text-sm font-semibold">{item.confidenceScore.toFixed(1)}%</p>
                                    </div>
                                    <Progress value={item.confidenceScore} className="h-2" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
