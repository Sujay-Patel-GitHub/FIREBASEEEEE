
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
import { summarizeDiseaseAnalysis } from '@/ai/flows/summarize-disease-analysis';
import { AnalysisChart } from './analysis-chart';
import { FilterAnalysisChart } from './filter-analysis-chart';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/context/auth-context';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit,getCountFromServer } from 'firebase/firestore';
import heic2any from 'heic2any';
import { Chatbot } from './chatbot';

export default function DashboardClient() {
  const { user, userId, isGuest, loading } = useAuth();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultType | null>(null);
  const [initialChatMessage, setInitialChatMessage] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [sobelImage, setSobelImage] = useState<string | null>(null);
  const [thermogramImage, setThermogramImage] = useState<string | null>(null);
  const [edgeScore, setEdgeScore] = useState(0);
  const [thermogramScore, setThermogramScore] = useState(0);
  const [totalAnalyses, setTotalAnalyses] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const isInitialMount = useRef(true);

  const handleReset = () => {
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setError(null);
    setUploadedImage(null);
    setSobelImage(null);
    setThermogramImage(null);
    setEdgeScore(0);
    setThermogramScore(0);
    setInitialChatMessage(undefined);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      handleReset();
    }
  }, [userId]);

  useEffect(() => {
    const fetchTotalAnalyses = async () => {
        if (!userId) return;
        try {
            const q = query(collection(db, 'analyses'), where('userId', '==', userId));
            const snapshot = await getCountFromServer(q);
            setTotalAnalyses(snapshot.data().count);
        } catch (e) {
            console.error("Error fetching analysis count: ", e);
        }
    };

    fetchTotalAnalyses();
  }, [userId]);

  const processImageWithCanvas = (dataUri: string, processFn: (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => ImageData | void): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return reject('Could not get canvas context');
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const result = processFn(ctx, img);
        if (result) {
          ctx.putImageData(result, 0, 0);
        }
        
        resolve(canvas.toDataURL());
      };
      img.onerror = reject;
      img.src = dataUri;
    });
  };

  const calculateScoreFromImageData = (dataUri: string, processFn: (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => number): Promise<number> => {
     return new Promise((resolve, reject) => {
      if (!dataUri) return resolve(0);
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return reject('Could not get canvas context');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve(processFn(ctx, img));
      };
      img.onerror = reject;
      img.src = dataUri;
    });
  };

  const applySobelFilter = (dataUri: string): Promise<string> => processImageWithCanvas(dataUri, (ctx) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const sobelData = applySobelFilterToData(imageData);
    return new ImageData(sobelData, ctx.canvas.width, ctx.canvas.height);
  });

  const applyThermogramFilter = (dataUri: string): Promise<string> => processImageWithCanvas(dataUri, (ctx) => {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    const data = imageData.data;
    const gradient = [[0, 0, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 0, 0]];

    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
      const normalizedGray = gray / 255;
      const colorIndex = normalizedGray * (gradient.length - 1);
      const lowerIndex = Math.floor(colorIndex);
      const upperIndex = Math.ceil(colorIndex);
      const t = colorIndex - lowerIndex;
      const r = gradient[lowerIndex][0] * (1 - t) + gradient[upperIndex][0] * t;
      const g = gradient[lowerIndex][1] * (1 - t) + gradient[upperIndex][1] * t;
      const b = gradient[lowerIndex][2] * (1 - t) + gradient[upperIndex][2] * t;
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
    return imageData;
  });

  const calculateEdgeScore = (dataUri: string): Promise<number> => calculateScoreFromImageData(dataUri, (ctx) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const sobelData = applySobelFilterToData(imageData);
      let totalMagnitude = 0;
      for (let i = 0; i < sobelData.length; i += 4) {
          totalMagnitude += sobelData[i];
      }
      const score = (totalMagnitude / (sobelData.length / 4) / 255) * 400; // Scaled for better visualization
      return Math.min(100, score); // Cap score at 100
  });

  const calculateThermogramScore = (dataUri: string): Promise<number> => calculateScoreFromImageData(dataUri, (ctx) => {
      const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      const data = imageData.data;
      let totalBrightness = 0;
      for (let i = 0; i < data.length; i += 4) {
          totalBrightness += (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]);
      }
      return (totalBrightness / (data.length / 4) / 255) * 100;
  });

  const applySobelFilterToData = (imageData: ImageData) => {
    const { data, width, height } = imageData;
    const grayData = new Uint8ClampedArray(width * height);
    for (let i = 0; i < data.length; i += 4) {
        grayData[i / 4] = (data[i] + data[i + 1] + data[i + 2]) / 3;
    }
    const sobelData = new Uint8ClampedArray(data.length).fill(0);
    const gxMatrix = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const gyMatrix = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0, gy = 0;
            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = (ky + 1) * 3 + (kx + 1);
                    const pixel = grayData[(y + ky) * width + (x + kx)];
                    gx += pixel * gxMatrix[idx];
                    gy += pixel * gyMatrix[idx];
                }
            }
            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const i = (y * width + x) * 4;
            sobelData[i] = sobelData[i+1] = sobelData[i+2] = magnitude;
            sobelData[i+3] = 255;
        }
    }
    return sobelData;
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files?.[0];
    if (!file) return;
  
    const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic');
    
    if (isHeic) {
      toast({
        title: 'Converting HEIC Image',
        description: 'Please wait while your image is converted...',
      });
      try {
        const convertedBlob = await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 0.8,
        });
        file = new File([convertedBlob as Blob], file.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' });
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Conversion Failed',
          description: 'Could not convert the HEIC image. Please try another format.',
        });
        return;
      }
    }
  
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Invalid File Type',
        description: 'Please upload an image file (e.g., JPG, PNG).',
      });
      return;
    }
  
    const reader = new FileReader();
    reader.onloadend = async () => {
      const dataUri = reader.result as string;
      setUploadedImage(dataUri);
      
      handleAnalyze(dataUri);
    };
    reader.readAsDataURL(file);
  };
  
  const saveAnalysis = async (result: Omit<AnalysisResultType, 'id' | 'userId'>) => {
    if (!userId) return;
    try {
        await addDoc(collection(db, 'analyses'), {
            ...result,
            userId: userId,
        });
        setTotalAnalyses(prev => prev + 1);
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
    setInitialChatMessage(undefined);

    toast({
      title: "Analysis Started",
      description: "Your leaf image is being analyzed by our AI.",
    });

    try {
       // Run client-side filters and AI analysis in parallel
      const [sobelResult, thermogramResult, edgeScoreResult, thermogramScoreResult, analysisData] = await Promise.all([
        applySobelFilter(dataUri),
        applyThermogramFilter(dataUri),
        calculateEdgeScore(dataUri),
        calculateThermogramScore(dataUri),
        analyzeLeaf({ photoDataUri: dataUri })
      ]);
      
      setSobelImage(sobelResult);
      setThermogramImage(thermogramResult);
      setEdgeScore(edgeScoreResult);
      setThermogramScore(thermogramScoreResult);
      
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
        const newResult: Omit<AnalysisResultType, 'id' | 'userId'> = {
          imageUrl: dataUri,
          analyzedAt: serverTimestamp(),
          isPlant: analysisData.isPlant,
          plantSpecies: analysisData.plantSpecies,
          diseaseDetection: analysisData.diseaseDetection,
          severity: analysisData.severity,
          confidenceScore: analysisData.confidenceScore,
          cause: analysisData.cause,
          treatment: analysisData.treatment,
        };
        
        setAnalysisResult({ 
            ...newResult, 
            id: new Date().toISOString(), 
            userId: userId!,
            analyzedAt: new Date() 
        });

        // Generate summary for chatbot
        const summaryResponse = await summarizeDiseaseAnalysis({
          plantSpecies: newResult.plantSpecies,
          diseaseDetection: `${newResult.diseaseDetection.name}: ${newResult.diseaseDetection.description}`,
          severityLevel: newResult.severity.level,
          confidenceScore: newResult.confidenceScore,
          causeOfDisease: newResult.cause,
          treatmentRecommendations: newResult.treatment.join(', ')
        });

        setInitialChatMessage(`${summaryResponse.summary} Do you have any other questions about this analysis?`);
        
        if (userId && !isGuest) {
            await saveAnalysis(newResult);
        }

        toast({
          title: "Analysis Complete",
          description: "Results have been saved to your history.",
        });
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
        {isLoading && (
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
    <div className="space-y-6 animate-fade-in-up">
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
            accept="image/*,.heic,.heif"
          />
        </div>
      </div>
      
      {analysisResult && (
        <div className="grid gap-6 md:grid-cols-2 animate-in fade-in-50 duration-500">
             <div className="rounded-lg p-6 bg-gradient-to-tr from-primary to-green-300 text-primary-foreground shadow-lg">
                <div className="flex flex-row items-center justify-between space-y-0">
                    <h3 className="text-sm font-medium">Plants Analyzed</h3>
                    <Microscope className="h-5 w-5" />
                </div>
                <div className="mt-4">
                    <div className="text-4xl font-bold">{isGuest ? 1 : totalAnalyses}</div>
                    <p className="text-xs text-primary-foreground/80">
                      {isGuest ? "Analysis in this session." : "Total analyses in your history."}
                    </p>
                </div>
            </div>
              <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Detection Accuracy</CardTitle>
                      <Leaf className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                      <div className="text-2xl font-bold">{analysisResult.confidenceScore.toFixed(1)}%</div>
                      <p className="text-xs text-muted-foreground">AI confidence for this analysis.</p>
                      <Progress value={analysisResult.confidenceScore} className="mt-2 h-2" />
                  </CardContent>
              </Card>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle>Image Analysis</CardTitle>
                <CardDescription>Upload an image to see the original and filtered versions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {uploadedImage ? (
                        <>
                            <ImageDisplay src={uploadedImage} alt="Uploaded leaf" title="Original Image" isLoading={isAnalyzing && !analysisResult} />
                            <ImageDisplay src={sobelImage} alt="Sobel filtered leaf" title="Sobel Edge Detection" isLoading={isAnalyzing && !sobelImage} />
                            <ImageDisplay src={thermogramImage} alt="Thermogram of leaf" title="Simulated Thermogram" isLoading={isAnalyzing && !thermogramImage} />
                        </>
                    ) : (
                        <div onClick={handleUploadClick} className="cursor-pointer md:col-span-2 lg:col-span-3">
                            <ImageDisplay src={null} alt="Upload placeholder" title="Upload an Image to Begin" isLoading={isAnalyzing} />
                        </div>
                    )}
                </div>
            </CardContent>
          </Card>
          
          <div className="lg:col-span-1 space-y-6">
             {isAnalyzing && !analysisResult && (
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis in Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <AnalysisSkeleton />
                  </CardContent>
                </Card>
             )}
             {error && (
                <Alert variant="destructive">
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
             )}
             {analysisResult ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Analysis Results</CardTitle>
                      <CardDescription>Detailed insights from our AI analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AnalysisResults result={analysisResult} />
                    </CardContent>
                  </Card>
                  <div className="space-y-6">
                    <AnalysisChart result={analysisResult} />
                    {(edgeScore > 0 || thermogramScore > 0) &&
                      <FilterAnalysisChart edgeScore={edgeScore} thermogramScore={thermogramScore} />
                    }
                  </div>
                </>
             ) : (
                !isAnalyzing && !error && (
                  <Card className="flex h-full items-center justify-center">
                    <CardContent className="text-center text-muted-foreground p-8">
                        <Microscope className="mx-auto h-12 w-12" />
                        <h3 className="mt-4 text-lg font-semibold">Awaiting Analysis</h3>
                        <p className="mt-1 text-sm">Upload a leaf image to begin.</p>
                    </CardContent>
                  </Card>
                )
             )}
          </div>
      </div>
      
      <Chatbot key={initialChatMessage} initialMessage={initialChatMessage} />
      
      <AnalysisHistoryPreview />
    </div>
  );
}
