import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type WalletType = "phantom" | "metamask" | "coinbase" | "google" | null;

interface User {
  id: string;
  email: string;
}

interface WalletContextType {
  isConnected: boolean;
  walletAddress: string | null;
  walletType: WalletType;
  balance: number;
  connect: (type: WalletType) => Promise<void>;
  disconnect: () => void;
  isConnecting: boolean;
  user: User | null;
  session: object | null;
  showDepositModal: boolean;
  setShowDepositModal: (show: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function generateMockAddress(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
  let result = '';
  for (let i = 0; i < 43; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [balance, setBalance] = useState(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<object | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const connect = useCallback(async (type: WalletType) => {
    if (!type) return;
    
    setIsConnecting(true);
    
    try {
      let address: string | null = null;

      if (type === "google") {
        // Mock Google wallet connection
        await new Promise(resolve => setTimeout(resolve, 800));
        address = generateMockAddress();
        setUser({ id: 'mock-google-user', email: 'user@gmail.com' });
        setSession({});
      } else if (type === "phantom") {
        const phantom = (window as any).phantom?.solana;
        
        if (phantom?.isPhantom) {
          const response = await phantom.connect();
          address = response.publicKey.toString();
        } else {
          window.open("https://phantom.app/", "_blank");
          throw new Error("Phantom wallet not installed");
        }
      } else if (type === "metamask") {
        const ethereum = (window as any).ethereum;
        
        if (ethereum?.isMetaMask) {
          const accounts = await ethereum.request({ method: "eth_requestAccounts" });
          address = accounts[0];
        } else {
          window.open("https://metamask.io/download/", "_blank");
          throw new Error("MetaMask not installed");
        }
      } else if (type === "coinbase") {
        const coinbase = (window as any).coinbaseWalletExtension || (window as any).ethereum?.isCoinbaseWallet;
        
        if (coinbase || (window as any).ethereum?.isCoinbaseWallet) {
          const ethereum = (window as any).ethereum;
          const accounts = await ethereum.request({ method: "eth_requestAccounts" });
          address = accounts[0];
        } else {
          window.open("https://www.coinbase.com/wallet", "_blank");
          throw new Error("Coinbase Wallet not installed");
        }
      }

      if (address) {
        setWalletAddress(address);
        setWalletType(type);
        setIsConnected(true);
        setBalance(Math.random() * 100);
        if (!user) {
          setUser({ id: 'mock-wallet-user', email: 'wallet@user.com' });
        }
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  const disconnect = useCallback(() => {
    setIsConnected(false);
    setWalletAddress(null);
    setWalletType(null);
    setBalance(0);
    setUser(null);
    setSession(null);

    // Disconnect from Phantom if connected
    const phantom = (window as any).phantom?.solana;
    if (phantom?.isConnected) {
      phantom.disconnect();
    }
  }, []);

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
        session,
        showDepositModal,
        setShowDepositModal,
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
