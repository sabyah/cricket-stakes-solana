import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { WalletProvider } from "@/contexts/WalletContext";
import { useTheme } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import MarketDetail from "./pages/MarketDetail";
import Profile from "./pages/Profile";
import CreatorTerminal from "./pages/CreatorTerminal";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || "";

// Solana wallet connectors for Privy (Phantom, etc.)
const solanaConnectors = toSolanaWalletConnectors({ shouldAutoConnect: false });

const router = createBrowserRouter(
  [
    { path: "/", element: <Index /> },
    { path: "/market/:id", element: <MarketDetail /> },
    { path: "/profile", element: <Profile /> },
    { path: "/creator", element: <CreatorTerminal /> },
    { path: "*", element: <NotFound /> },
  ],
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    },
  }
);

if (!PRIVY_APP_ID && import.meta.env.DEV) {
  console.error(
    "⚠️ Privy App ID is missing!\n" +
      "Please create a .env file in the root directory with:\n" +
      "VITE_PRIVY_APP_ID=your_privy_app_id_here\n\n" +
      "Get your App ID from: https://dashboard.privy.io"
  );
}

const App = () => {
  const { theme: themeMode } = useTheme();
  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  const privyTheme = isDark ? "dark" : "light";

  const appContent = (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <RouterProvider router={router} />
      </TooltipProvider>
    </QueryClientProvider>
  );

  if (!PRIVY_APP_ID) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <span className="text-amber-500 text-xl">🧪</span>
            </div>
            <div>
              <h2 className="text-xl font-bold">Dev mode</h2>
              <p className="text-sm text-muted-foreground">No Privy App ID – use placeholder to load app</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <p>To connect Privy, please:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>
                Get your App ID from{" "}
                <a
                  href="https://dashboard.privy.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Privy Dashboard
                </a>
              </li>
              <li>
                Create a <code className="bg-secondary px-1 py-0.5 rounded">.env</code> file in the root directory
              </li>
              <li>
                Add: <code className="bg-secondary px-1 py-0.5 rounded">VITE_PRIVY_APP_ID=your_app_id</code>
              </li>
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
        loginMethods: ["email", "google", "twitter", "wallet"],
        appearance: {
          theme: privyTheme,
          accentColor: "#676FFF",
          logo: "/og-image.jpeg",
          walletChainType: "ethereum-and-solana",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
          requireUserPasswordOnCreate: false,
        },
        externalWallets: {
          solana: {
            connectors: solanaConnectors,
          },
        },
      }}
    >
      <WalletProvider>
        {appContent}
      </WalletProvider>
    </PrivyProvider>
  );
};

export default App;
