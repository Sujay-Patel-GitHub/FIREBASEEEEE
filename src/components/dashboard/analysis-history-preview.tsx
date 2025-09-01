'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Button } from "../ui/button";

export function AnalysisHistoryPreview() {
    const { isGuest } = useAuth();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Analysis History</CardTitle>
                <CardDescription>
                    {isGuest 
                        ? "Sign in to save and view your analysis history." 
                        : "A preview of your most recent analyses."}
                </CardDescription>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-8">
                 <History className="mx-auto h-12 w-12" />
                 {isGuest ? (
                     <>
                        <p className="mt-4">Your analysis history is not saved in guest mode.</p>
                        <Link href="/auth/signin">
                            <Button className="mt-4">Sign In to Save History</Button>
                        </Link>
                     </>
                 ) : (
                    <p className="mt-4">Perform an analysis to see the results here.</p>
                 )}
            </CardContent>
        </Card>
    )
}
