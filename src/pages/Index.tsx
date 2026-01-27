import { useState } from "react";
import { StoryFeed } from "@/components/StoryFeed";
import { MarketModal } from "@/components/MarketModal";
import { Market } from "@/data/markets";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, Info } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/contexts/WalletContext";

const Index = () => {
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const { connect, isConnected } = useWallet();

  // Mock trade count - in production this would come from user state
  const [tradeCount] = useState(3);
  const tradesNeeded = 10;
  const canSubmit = tradeCount >= tradesNeeded;

  const handleOpenWallet = async () => {
    if (isConnected) return;
    try {
      connect("phantom");
    } catch (error) {
      console.error("Failed to open wallet:", error);
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error(`Complete ${tradesNeeded - tradeCount} more trades to submit`);
      return;
    }
    toast.success("Submission successful!");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Custom Header for Voicefi */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          {/* KGeN Logo - Top Left */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">KG</span>
            </div>
            <span className="text-lg font-bold">KGeN</span>
          </div>

          {/* Voicefi powered by YeNo - Center/Right */}
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-semibold">Voicefi</span>
            <span className="text-xs text-muted-foreground">powered by</span>
            <div className="flex items-center gap-1">
              <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-background font-bold text-[10px]">YN</span>
              </div>
              <span className="text-sm font-semibold text-primary">YeNo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Badge at Top */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border/50">
          <Info className="w-4 h-4 text-primary flex-shrink-0" />
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs sm:text-sm">
            Just complete {tradesNeeded} trades and you'll be able to submit
          </Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            ({tradeCount}/{tradesNeeded})
          </span>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-24">
        <StoryFeed onSelectMarket={setSelectedMarket} />
      </main>

      {/* Submit Button - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-sm border-t border-border/50 p-4 safe-area-inset-bottom">
        <div className="container mx-auto max-w-lg">
          <Button 
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full h-12 text-base font-semibold gap-2"
            variant={canSubmit ? "gradient" : "secondary"}
          >
            <Send className="w-5 h-5" />
            {canSubmit ? "Submit" : `Complete ${tradesNeeded - tradeCount} more trades`}
          </Button>
        </div>
      </div>

      <MarketModal 
        market={selectedMarket} 
        onClose={() => setSelectedMarket(null)}
        onOpenWallet={handleOpenWallet}
      />
    </div>
  );
};

export default Index;
