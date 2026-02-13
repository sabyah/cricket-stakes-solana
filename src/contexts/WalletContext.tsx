import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { apiClient } from "@/lib/api";

export type WalletType =
  | "phantom"
  | "metamask"
  | "coinbase"
  | "rabby"
  | "wallet_connect"
  | "privy_embedded"
  | null;

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  walletType: WalletType;
  balance: number;
  connect: (type?: WalletType) => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  user: {
    id?: string;
    email?: string;
    name?: string;
    avatar?: string;
  } | null;
  showDepositModal: boolean;
  setShowDepositModal: (show: boolean) => void;
  ready: boolean;
  authenticated: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function normalizeClientType(wallet: any): string {
  const wt = wallet?.walletClientType ?? wallet?.wallet_client_type ?? "";
  return String(wt).toLowerCase();
}

function isRabbyWallet(wallet: any): boolean {
  const hints: unknown[] = [
    wallet?.name,
    wallet?.connectorName,
    wallet?.connector_name,
    wallet?.walletName,
    wallet?.wallet_name,
    wallet?.metadata?.name,
    wallet?.metadata?.walletName,
    wallet?.metadata?.wallet_name,
  ];

  const text = hints
    .filter(Boolean)
    .map((x) => String(x).toLowerCase())
    .join(" ");

  return text.includes("rabby");
}

function mapPrivyWalletType(wallet: any): WalletType {
  const clientType = normalizeClientType(wallet);

  if (clientType === "privy") return "privy_embedded";
  if (clientType === "phantom") return "phantom";
  if (clientType === "coinbase_wallet") return "coinbase";
  if (clientType === "metamask") return "metamask";
  if (clientType === "wallet_connect") return isRabbyWallet(wallet) ? "rabby" : "wallet_connect";

  // Sometimes Privy exposes injected wallets under this label depending on env
  if (clientType === "detected_ethereum_wallets") return isRabbyWallet(wallet) ? "rabby" : "wallet_connect";

  return null;
}

/**
 * Desired order:
 * phantom > coinbase > metamask > rabby > embedded
 */
function pickPreferredWalletFromPrivy(privyWallets: any[]): any | null {
  if (!privyWallets?.length) return null;

  const phantom = privyWallets.find((w) => normalizeClientType(w) === "phantom");
  const coinbase = privyWallets.find((w) => normalizeClientType(w) === "coinbase_wallet");
  const metamask = privyWallets.find((w) => normalizeClientType(w) === "metamask");

  const wcWallets = privyWallets.filter((w) => normalizeClientType(w) === "wallet_connect");
  const rabbyWc = wcWallets.find((w) => isRabbyWallet(w));

  const embedded = privyWallets.find((w) => normalizeClientType(w) === "privy");

  return phantom || coinbase || metamask || rabbyWc || wcWallets[0] || embedded || privyWallets[0];
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { ready, authenticated, user: privyUser, login, logout, getAccessToken } = usePrivy();
  const { wallets: privyWallets } = useWallets();

  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<WalletContextType["user"]>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    if (ready && authenticated && privyUser && !hasSynced) {
      syncUserData();
    } else if (!authenticated) {
      setIsConnected(false);
      setWalletAddress(null);
      setWalletType(null);
      setBalance(0);
      setUser(null);
      setHasSynced(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, authenticated, privyUser, hasSynced]);

  useEffect(() => {
    if (privyWallets && privyWallets.length > 0) {
      const preferred = pickPreferredWalletFromPrivy(privyWallets as any[]);
      if (preferred) {
        setWalletAddress(preferred.address);
        setWalletType(mapPrivyWalletType(preferred));
        setIsConnected(true);
      }
    } else if (!authenticated) {
      setWalletAddress(null);
      setIsConnected(false);
      setWalletType(null);
    }
  }, [privyWallets, authenticated]);

  const syncUserData = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      // ✅ critical: sets Authorization header for /api/onramp/url and other protected routes
      apiClient.setToken(token);

      const data = await apiClient.verifyToken(token);

      setUser({
        id: data.user.id,
        email: data.user.email || undefined,
        name: data.user.name || undefined,
        avatar: data.user.avatar || undefined,
      });

      const backendWallets = Array.isArray(data.wallets) ? data.wallets : [];
      const preferredBackend = backendWallets.find((w: any) => w.isPrimary) || backendWallets[0];

      if (preferredBackend) {
        setWalletAddress(preferredBackend.address);
        setWalletType(preferredBackend.walletType as WalletType);
        setIsConnected(true);
      } else {
        const preferred = pickPreferredWalletFromPrivy(privyWallets as any[]);
        if (preferred) {
          setWalletAddress(preferred.address);
          setWalletType(mapPrivyWalletType(preferred));
          setIsConnected(true);
        }
      }

      setHasSynced(true);
    } catch (error) {
      const isNetworkError =
        error instanceof TypeError && (error.message === "Failed to fetch" || error.message === "Network error");

      if (isNetworkError) {
        setUser({
          id: privyUser?.id,
          email: privyUser?.email?.address,
          name: privyUser?.name ?? undefined,
          avatar: privyUser?.avatar ?? undefined,
        });
      } else {
        console.error("Error syncing user data:", error);
      }
      setHasSynced(true);
    }
  };

  const connect = useCallback(
    async (_type?: WalletType) => {
      setIsConnecting(true);
      try {
        if (!authenticated) {
          await login();
        }
      } finally {
        setIsConnecting(false);
      }
    },
    [authenticated, login]
  );

  const disconnect = useCallback(async () => {
    await logout();
    setIsConnected(false);
    setWalletAddress(null);
    setWalletType(null);
    setBalance(0);
    setUser(null);
    setHasSynced(false);
  }, [logout]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        walletType,
        balance,
        connect,
        disconnect,
        isConnecting,
        user,
        showDepositModal,
        setShowDepositModal,
        ready,
        authenticated,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) throw new Error("useWallet must be used within a WalletProvider");
  return context;
}
