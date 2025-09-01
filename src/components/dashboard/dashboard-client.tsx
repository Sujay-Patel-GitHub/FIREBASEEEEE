'use client';

import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { UploadCloud, X, Leaf, Microscope } from 'lucide-react';
import type { AnalysisResult as AnalysisResultType } from '@/types';
import { AnalysisResults } from './analysis-results';
import { AnalysisHistoryPreview } from './analysis-history-preview';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { analyzeLeaf } from '@/ai/flows/analyze-leaf-flow';
import { AnalysisChart } from './analysis-chart';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

const sobelEdgeDetection = (imageData: ImageData): ImageData => {
    const width = imageData.width;
    const height = imageData.height;
    const grayscale = new Uint8ClampedArray(width * height);
    const output = new ImageData(width, height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        grayscale[i / 4] = avg;
    }

    const sobelX = [
        [-1, 0, 1],
        [-2, 0, 2],
        [-1, 0, 1]
    ];
    const sobelY = [
        [-1, -2, -1],
        [0, 0, 0],
        [1, 2, 1]
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let pixelX = 0;
            let pixelY = 0;

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const pixel = grayscale[(y + i) * width + (x + j)];
                    pixelX += pixel * sobelX[i + 1][j + 1];
                    pixelY += pixel * sobelY[i + 1][j + 1];
                }
            }
            
            const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
            const outputIndex = (y * width + x) * 4;
            output.data[outputIndex] = magnitude;
            output.data[outputIndex + 1] = magnitude;
            output.data[outputIndex + 2] = magnitude;
            output.data[outputIndex + 3] = 255;
        }
    }
    return output;
};

const generateEdgeImage = async (dataUri: string): Promise<string> => {
    return new Promise((resolve) => {
        const image = document.createElement('img');
        image.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve('');

            ctx.drawImage(image, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const edgeData = sobelEdgeDetection(imageData);
            
            for (let i = 0; i < edgeData.data.length; i += 4) {
                const color = edgeData.data[i];
                edgeData.data[i] = 255 - color;
                edgeData.data[i + 1] = 255 - color;
                edgeData.data[i + 2] = 255 - color;
            }

            ctx.putImageData(edgeData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        image.src = dataUri;
    });
};

export default function DashboardClient() {
  const { user, isGuest } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [edgeImage, setEdgeImage] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user) {
        const q = query(
          collection(db, 'analyses'),
          where('userId', '==', user.uid),
          orderBy('analyzedAt', 'desc'),
          limit(1)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const latestDoc = querySnapshot.docs[0];
            const data = latestDoc.data();
             const result: AnalysisResultType = {
                id: latestDoc.id,
                ...data,
                analyzedAt: data.analyzedAt.toDate(),
            } as AnalysisResultType;
            setAnalysisResult(result);
            setUploadedImage(result.imageUrl);
        }
      }
    };
    fetchHistory();
  }, [user]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Invalid File Type',
          description: 'Please upload an image file (e.g., JPG, PNG).',
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setUploadedImage(dataUri);
        handleAnalyze(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const saveAnalysis = async (result: Omit<AnalysisResultType, 'id'>) => {
    if (!user) return;
    try {
        await addDoc(collection(db, 'analyses'), {
            ...result,
            userId: user.uid,
        });
    } catch (e) {
        console.error("Error adding document: ", e);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save analysis to your history.',
        });
    }
  };


  const handleAnalyze = async (dataUri: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setError(null);
    setEdgeImage(null);

    toast({
      title: "Analysis Started",
      description: "Your leaf image is being analyzed by our AI.",
    });

    try {
      const analysisData = await analyzeLeaf({ photoDataUri: dataUri });

      if (!analysisData.isPlant) {
        setError("The uploaded image does not appear to be a plant. Please try another image.");
        toast({
            variant: 'destructive',
            title: 'Analysis Failed',
            description: 'No plant was detected in the image.',
        });
        setAnalysisResult(null);
        setUploadedImage(dataUri);
      } else {
        const newResult: AnalysisResultType = {
          id: new Date().toISOString(),
          imageUrl: dataUri,
          analyzedAt: serverTimestamp(), // Use server timestamp
          ...analysisData,
        };
        
        // Don't set state with server timestamp, convert to Date for immediate use
        setAnalysisResult({ ...newResult, analyzedAt: new Date() });
        setAnalysisCount(prev => prev + 1);
        
        if (!isGuest) {
            await saveAnalysis(newResult);
        }

        toast({
          title: "Analysis Complete",
          description: isGuest ? "Sign in to save results." : "Results have been saved to your history.",
        });

        const edgeDataUri = await generateEdgeImage(dataUri);
        setEdgeImage(edgeDataUri);
      }
    } catch (e: any) {
      console.error(e);
      const errorMessage = e.message || 'An unexpected error occurred.';
      setError(errorMessage);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: errorMessage,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadClick = () => {
    if (isAnalyzing) return;
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
    setUploadedImage(null);
    setEdgeImage(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const AnalysisSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
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
  );

  const ImageDisplay = ({src, alt, title, isLoading}: {src: string | null, alt: string, title: string, isLoading?: boolean}) => (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="aspect-video w-full rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center bg-muted/20 relative transition-all hover:border-primary/50"
      >
        {!src && !isLoading && (
          <div className="text-center text-muted-foreground p-4">
            <UploadCloud className="mx-auto h-12 w-12" />
            <p className="mt-4 font-semibold">Click or drag to upload</p>
            <p className="text-xs mt-1">PNG, JPG, WEBP up to 10MB</p>
          </div>
        )}
        {src && (
          <Image src={src} alt={alt} layout="fill" objectFit="contain" className="rounded-lg p-1"/>
        )}
        {isLoading && !analysisResult && (
          <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center rounded-lg backdrop-blur-sm">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin" style={{borderTopColor: 'hsl(var(--primary))'}}></div>
            <p className="text-lg font-semibold text-primary">Analyzing...</p>
            <p className="text-sm text-muted-foreground">Our AI is hard at work.</p>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {isGuest ? "Welcome, Guest!" : `Welcome, ${user?.displayName || 'User'}!`} Get an overview of your plant health.
          </p>
        </div>
        <div className="flex items-center gap-4">
          { (uploadedImage || isAnalyzing) && 
            <Button variant="outline" onClick={handleReset}><X className="mr-2 h-4 w-4"/> Clear Analysis</Button>
          }
          <Button onClick={handleUploadClick} disabled={isAnalyzing}>
            <Leaf className="mr-2 h-4 w-4" /> Analyze Plant
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*"
          />
        </div>
      </div>

       <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Plants Analyzed</CardTitle>
                    <Microscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{analysisCount}</div>
                    <p className="text-xs text-muted-foreground">Analyses in this session.</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
                    <Leaf className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    {analysisResult ? (
                        <>
                            <div className="text-2xl font-bold">{analysisResult.confidenceScore.toFixed(1)}%</div>
                            <p className="text-xs text-muted-foreground">AI confidence for the latest analysis.</p>
                            <Progress value={analysisResult.confidenceScore} className="mt-2 h-2" />
                        </>
                    ) : (
                        <>
                           <div className="text-2xl font-bold">-</div>
                           <p className="text-xs text-muted-foreground">Analysis required.</p>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>


      <Card>
        <CardHeader>
            <CardTitle>AI Analysis</CardTitle>
            <CardDescription>Upload an image of a plant leaf to detect diseases and get treatment recommendations.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
            <div className="lg:col-span-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
               {uploadedImage ? (
                 <>
                  <ImageDisplay src={uploadedImage} alt="Uploaded leaf" title="Original Image" isLoading={isAnalyzing} />
                  <div className="relative">
                    <ImageDisplay src={edgeImage} alt="Edge-detected leaf" title="Edge Detection" isLoading={isAnalyzing && !!analysisResult && !edgeImage}/>
                  </div>
                 </>
               ) : (
                <div onClick={handleUploadClick} className="cursor-pointer">
                  <ImageDisplay src={null} alt="Upload placeholder" title="Original Image" isLoading={isAnalyzing} />
                </div>
               )}
            </div>
            <div className="lg:col-span-1">
                 {isAnalyzing && !analysisResult && <AnalysisSkeleton />}
                 {error && (
                    <Alert variant="destructive">
                        <AlertTitle>Analysis Failed</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                 )}
                 {analysisResult && <AnalysisResults result={analysisResult} />}
                 {!isAnalyzing && !analysisResult && !error && (
                    <div className="flex h-full items-center justify-center rounded-lg bg-muted/20 p-8">
                      <div className="text-center text-muted-foreground">
                          <Microscope className="mx-auto h-12 w-12" />
                          <h3 className="mt-4 text-lg font-semibold">Awaiting Analysis</h3>
                          <p className="mt-1 text-sm">Upload a leaf image to begin.</p>
                      </div>
                    </div>
                 )}
            </div>
        </CardContent>
      </Card>
      
      {analysisResult && <AnalysisChart result={analysisResult} />}

      <AnalysisHistoryPreview />
    </div>
  );
}

