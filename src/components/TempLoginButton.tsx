import { useState } from 'react';
import { useSyncUser } from '@/hooks/useMarkets';
import { User } from 'lucide-react';

export function TempLoginButton() {
  const { mutate: syncUser, isPending } = useSyncUser();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLogin = () => {
    // Generate a random wallet address for testing
    const randomWallet = `0x${Array.from({length: 40}, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    
    syncUser({
      walletAddress: randomWallet,
      displayName: `Test User ${Math.floor(Math.random() * 1000)}`,
    }, {
      onSuccess: (data) => {
        alert(`Logged in as ${data.user.displayName}`);
        window.location.reload(); // Refresh to update UI state
      }
    });
  };

  return (
    <button
      onClick={handleLogin}
      disabled={isPending}
      className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 rounded-lg border border-yellow-500/50 transition-colors text-sm font-medium"
    >
      <User className="w-4 h-4" />
      {isPending ? 'Logging in...' : 'Dev Login'}
    </button>
  );
}
