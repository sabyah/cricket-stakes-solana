import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { apiClient } from "@/lib/api";

export type WalletType = "phantom" | "metamask" | "coinbase" | "privy_embedded" | null;

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

export function WalletProvider({ children }: { children: ReactNode }) {
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    logout,
    getAccessToken,
  } = usePrivy();
  const { wallets: privyWallets } = useWallets();

  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<WalletContextType["user"]>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  // Sync user and wallet data with backend when authenticated
  useEffect(() => {
    if (ready && authenticated && privyUser && !hasSynced) {
      syncUserData();
    } else if (!authenticated) {
      // Clear state on logout
      setIsConnected(false);
      setWalletAddress(null);
      setWalletType(null);
      setBalance(0);
      setUser(null);
      setHasSynced(false);
    }
  }, [ready, authenticated, privyUser, hasSynced]);

  // Update wallet address when Privy wallets change
  useEffect(() => {
    if (privyWallets && privyWallets.length > 0) {
      const primaryWallet = privyWallets.find((w) => w.walletClientType === 'privy') || privyWallets[0];
      if (primaryWallet) {
        setWalletAddress(primaryWallet.address);
        setIsConnected(true);
        
        // Determine wallet type
        if (primaryWallet.walletClientType === 'privy') {
          setWalletType('privy_embedded');
        } else if (primaryWallet.walletClientType === 'metamask') {
          setWalletType('metamask');
        } else if (primaryWallet.walletClientType === 'coinbase_wallet') {
          setWalletType('coinbase');
        } else if (primaryWallet.walletClientType === 'phantom') {
          setWalletType('phantom');
        }
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

      // Verify token and sync with backend
      const data = await apiClient.verifyToken(token);
      
      setUser({
        id: data.user.id,
        email: data.user.email || undefined,
        name: data.user.name || undefined,
        avatar: data.user.avatar || undefined,
      });

      // Set primary wallet if available
      const primaryWallet = data.wallets.find((w) => w.isPrimary) || data.wallets[0];
      if (primaryWallet) {
        setWalletAddress(primaryWallet.address);
        setWalletType(primaryWallet.walletType as WalletType);
        setIsConnected(true);
      }

      setHasSynced(true);
    } catch (error) {
      console.error("Error syncing user data:", error);
    }
  };

  const connect = useCallback(async (type?: WalletType) => {
    setIsConnecting(true);
    
    try {
      if (!authenticated) {
        // Login with Privy - it will handle all wallet connections
        await login();
      } else {
        // If already authenticated, Privy handles wallet connections through its UI
        // This is typically handled by Privy's built-in wallet connection flow
        console.log("Already authenticated. Use Privy's wallet connection UI.");
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [authenticated, login]);

  const disconnect = useCallback(async () => {
    try {
      await logout();
      setIsConnected(false);
      setWalletAddress(null);
      setWalletType(null);
      setBalance(0);
      setUser(null);
      setHasSynced(false);
    } catch (error) {
      console.error("Failed to disconnect:", error);
      throw error;
    }
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
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
