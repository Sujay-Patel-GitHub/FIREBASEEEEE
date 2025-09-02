
import { Logo } from '../logo';

export function WelcomeSplash() {
  return (
    <div className="animated-border-box">
      <div className="w-full rounded-lg bg-card p-8 md:p-12 text-center shadow-sm border">
        <div className="max-w-md mx-auto">
          <Logo className="w-32 h-32 md:w-40 md:h-40 mx-auto" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-6">
            Welcome to HARITRAKSHAK
          </h1>
          <p className="mt-3 text-base md:text-lg text-gray-600">
            Intelligent insights for a greener tomorrow.
          </p>
        </div>
      </div>
    </div>
  );
}
