import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { CoinbaseIcon } from "@/components/icons/WalletIcons";
import { TransferCryptoModal } from "@/components/TransferCryptoModal";
import { apiClient } from "@/lib/api";
import { CoinbaseOnrampModal } from "@/components/CoinbaseOnrampModal";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CryptoNetworkIcons = () => (
  <div className="flex items-center -space-x-1">
    {/* keep if you want; not enforcing */}
    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9945FF] to-[#14F195] flex items-center justify-center border-2 border-card">
      <span className="text-white text-[8px] font-bold">S</span>
    </div>
    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center border-2 border-card">
      <span className="text-muted-foreground text-[8px] font-bold">+ </span>
    </div>
  </div>
);

export function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { balance, walletAddress } = useWallet();

  const [isConnectingExchange, setIsConnectingExchange] = useState(false);
  const [showTransferCrypto, setShowTransferCrypto] = useState(false);
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

  const handleTransferCrypto = () => setShowTransferCrypto(true);
  const handleBackFromTransfer = () => setShowTransferCrypto(false);

  const handleConnectExchange = async () => {
    if (!walletAddress) {
      toast.error("No wallet address found yet. Please connect/login first.");
      return;
    }

    setIsConnectingExchange(true);
    try {
      // ✅ no chain strictness passed from frontend; backend decides or is configurable
      const { url } = await apiClient.getOnrampUrl({
        destinationAddress: walletAddress,
      });
      setOnrampUrl(url);
    } catch (err: any) {
      toast.error(err?.message || "Failed to start Coinbase Onramp");
    } finally {
      setIsConnectingExchange(false);
    }
  };

  if (!isOpen) return null;

  if (showTransferCrypto) {
    return (
      <TransferCryptoModal
        isOpen={true}
        onClose={onClose}
        onBack={handleBackFromTransfer}
      />
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <h2 className="text-xl font-bold">Deposit</h2>
                <p className="text-sm text-muted-foreground">
                  AlphaX Balance: ${balance.toFixed(2)}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-secondary transition-colors absolute right-4 top-4"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            <button
              onClick={handleTransferCrypto}
              className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/50 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-foreground">Transfer Crypto</span>
                    <p className="text-sm text-muted-foreground">No limit • Instant</p>
                  </div>
                </div>
                <CryptoNetworkIcons />
              </div>
            </button>

            <button
              onClick={handleConnectExchange}
              disabled={isConnectingExchange}
              className="w-full p-4 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/50 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="text-left">
                    <span className="font-semibold text-foreground">Connect Exchange</span>
                    <p className="text-sm text-muted-foreground">Coinbase Onramp</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {isConnectingExchange ? (
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                  ) : (
                    <div className="w-8 h-8 rounded-full overflow-hidden">
                      <CoinbaseIcon className="w-full h-full" />
                    </div>
                  )}
                </div>
              </div>
            </button>
          </div>

          <div className="p-4 bg-secondary/30 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              More deposit options coming soon
            </p>
          </div>
        </motion.div>

        {onrampUrl && (
          <CoinbaseOnrampModal
            isOpen={true}
            url={onrampUrl}
            onClose={() => setOnrampUrl(null)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
