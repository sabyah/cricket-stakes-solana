import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink } from "lucide-react";

export function CoinbaseOnrampModal({
  isOpen,
  url,
  onClose,
}: {
  isOpen: boolean;
  url: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
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
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div className="font-semibold">Coinbase Onramp</div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="p-5 space-y-3">
            <p className="text-sm text-muted-foreground">
              Coinbase Pay can’t be embedded inside this app (browser blocks iframes). Open it in a new tab to continue.
            </p>

            <button
              onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open Coinbase Onramp
            </button>

            <div className="text-xs text-muted-foreground break-all">
              If the button doesn’t work, copy this link:
              <div className="mt-1 p-2 rounded bg-secondary/50 select-all">{url}</div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
