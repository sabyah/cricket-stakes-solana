import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { WalletProvider } from "@/contexts/WalletContext";
import Index from "./pages/Index";
import MarketDetail from "./pages/MarketDetail";
import Profile from "./pages/Profile";
import CreatorTerminal from "./pages/CreatorTerminal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || "";

// Show error if Privy App ID is missing
if (!PRIVY_APP_ID && import.meta.env.DEV) {
  console.error(
    "⚠️ Privy App ID is missing!\n" +
    "Please create a .env file in the root directory with:\n" +
    "VITE_PRIVY_APP_ID=your_privy_app_id_here\n\n" +
    "Get your App ID from: https://dashboard.privy.io"
  );
}

const App = () => {
  // Show error message if App ID is missing
  if (!PRIVY_APP_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <span className="text-destructive text-xl">⚠️</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Privy App ID Missing</h2>
              <p className="text-sm text-muted-foreground">Configuration required</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>To connect Privy, please:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Get your App ID from <a href="https://dashboard.privy.io" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Privy Dashboard</a></li>
              <li>Create a <code className="bg-secondary px-1 py-0.5 rounded">.env</code> file in the root directory</li>
              <li>Add: <code className="bg-secondary px-1 py-0.5 rounded">VITE_PRIVY_APP_ID=your_app_id</code></li>
              <li>Restart the dev server</li>
            </ol>
          </div>
          <div className="pt-4 border-t border-border">
            <a 
              href="https://dashboard.privy.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Privy App ID
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PrivyProvider
      appId={PRIVY_APP_ID}
      config={{
        loginMethods: ['email', 'google', 'twitter', 'wallet'],
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
          logo: '/logo.svg',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
          requireUserPasswordOnCreate: false,
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WalletProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/market/:id" element={<MarketDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/creator" element={<CreatorTerminal />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </WalletProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default App;
