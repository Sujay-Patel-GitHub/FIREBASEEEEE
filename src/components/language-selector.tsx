'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/context/language-context';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
];

export function LanguageSelector() {
  const { showLanguageModal, setShowLanguageModal, setLanguage } = useLanguage();

  const handleLanguageSelect = (langCode: 'en' | 'hi' | 'gu') => {
    setLanguage(langCode);
    setShowLanguageModal(false);
  };

  return (
    <AlertDialog open={showLanguageModal} onOpenChange={setShowLanguageModal}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Choose Your Language</AlertDialogTitle>
          <AlertDialogDescription>
            Select your preferred language for the application.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          {languages.map((lang) => (
            <Button
              key={lang.code}
              variant="outline"
              onClick={() => handleLanguageSelect(lang.code as 'en' | 'hi' | 'gu')}
            >
              {lang.name}
            </Button>
          ))}
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
