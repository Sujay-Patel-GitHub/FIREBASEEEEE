
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { AnalysisResult } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { AnalysisResults } from '@/components/dashboard/analysis-results';
import { AnalysisChart } from '@/components/dashboard/analysis-chart';
import { AlertTriangle, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';


export default function AnalysisDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = typeof params.id === 'string' ? params.id : '';
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
        setLoading(false);
        setError('No analysis ID provided.');
        return;
    };

    const fetchAnalysis = async () => {
      try {
        const docRef = doc(db, 'analyses', id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setAnalysis({
            id: docSnap.id,
            ...data,
            analyzedAt: data.analyzedAt.toDate(),
          } as AnalysisResult);
        } else {
          setError('Analysis not found.');
        }
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load analysis details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [id]);
  
  const handleDelete = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
        const docRef = doc(db, 'analyses', id);
        await deleteDoc(docRef);
        toast({
            title: "Success",
            description: "Analysis record deleted successfully.",
        });
        router.push('/analysis-history');
    } catch (err) {
        console.error("Error deleting document:", err);
        setError("Failed to delete the analysis record.");
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the analysis record. Please try again.",
        });
    } finally {
        setIsDeleting(false);
    }
  };


  const AnalysisDetailSkeleton = () => (
    <div className="space-y-6">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
        </div>
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-5 w-2/5" />
                        <Skeleton className="h-4 w-4/5 mt-1" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      {loading ? (
        <AnalysisDetailSkeleton />
      ) : error ? (
        <Card className="bg-destructive/10 border-destructive">
            <CardHeader>
                <div className="flex items-center gap-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                    <div>
                        <CardTitle className="text-destructive">Error</CardTitle>
                        <CardDescription className="text-destructive/80">{error}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Link href="/analysis-history">
                    <Button variant="secondary">Go Back to History</Button>
                </Link>
            </CardContent>
        </Card>
      ) : analysis ? (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex-grow">
                  <Button variant="outline" onClick={() => router.back()} className="mb-4">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                  </Button>
                  <h1 className="text-3xl font-bold">Analysis Details</h1>
                  <p className="text-muted-foreground">
                      Results from analysis performed on {new Date(analysis.analyzedAt).toLocaleString()}
                  </p>
              </div>
              <AlertDialog>
                  <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full sm:w-auto">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Record
                      </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                      <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete this analysis record from our servers.
                          </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? "Deleting..." : "Continue"}
                          </AlertDialogAction>
                      </AlertDialogFooter>
                  </AlertDialogContent>
              </AlertDialog>
            </div>


            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Original Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative aspect-square">
                                <Image src={analysis.imageUrl} alt={`Analysis of ${analysis.plantSpecies}`} layout="fill" objectFit="cover" className="rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                    <AnalysisChart result={analysis} />
                 </div>
                 <div className="lg:col-span-2">
                    <AnalysisResults result={analysis} />
                 </div>
            </div>
        </div>
      ) : null}
    </div>
  );
}
