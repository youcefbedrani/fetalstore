'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useProtection } from '@/hooks/useProtection';

interface ProtectionContextType {
  isProtected: boolean;
  enableProtection: () => void;
  disableProtection: () => void;
  config: ProtectionConfig;
  updateConfig: (newConfig: Partial<ProtectionConfig>) => void;
}

interface ProtectionConfig {
  disableRightClick?: boolean;
  disableTextSelection?: boolean;
  disableKeyboardShortcuts?: boolean;
  disableDrag?: boolean;
  disableImageDrag?: boolean;
  disablePrint?: boolean;
  showWarning?: boolean;
  warningMessage?: string;
}

const ProtectionContext = createContext<ProtectionContextType | undefined>(undefined);

interface ProtectionProviderProps {
  children: React.ReactNode;
  config?: ProtectionConfig;
  enableInProduction?: boolean;
}

export const ProtectionProvider: React.FC<ProtectionProviderProps> = ({
  children,
  config: initialConfig = {},
  enableInProduction = true
}) => {
  const [isProtected, setIsProtected] = useState(false);
  const [config, setConfig] = useState<ProtectionConfig>({
    disableRightClick: true,
    disableTextSelection: true,
    disableKeyboardShortcuts: true,
    disableDrag: true,
    disableImageDrag: true,
    disablePrint: true,
    showWarning: true,
    warningMessage: 'This content is protected. Copying is not allowed.',
    ...initialConfig
  });

  // Only enable protection in production or when explicitly enabled
  const shouldProtect = process.env.NODE_ENV === 'production' || enableInProduction;

  const protection = useProtection(shouldProtect ? config : {});

  useEffect(() => {
    setIsProtected(shouldProtect);
  }, [shouldProtect]);

  const enableProtection = () => {
    setIsProtected(true);
    protection.enableProtection();
  };

  const disableProtection = () => {
    setIsProtected(false);
    protection.disableProtection();
  };

  const updateConfig = (newConfig: Partial<ProtectionConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const contextValue: ProtectionContextType = {
    isProtected,
    enableProtection,
    disableProtection,
    config,
    updateConfig
  };

  return (
    <ProtectionContext.Provider value={contextValue}>
      {children}
    </ProtectionContext.Provider>
  );
};

export const useProtectionContext = (): ProtectionContextType => {
  const context = useContext(ProtectionContext);
  if (context === undefined) {
    throw new Error('useProtectionContext must be used within a ProtectionProvider');
  }
  return context;
};

// Higher-order component for easy integration
export const withProtection = <P extends object>(
  Component: React.ComponentType<P>,
  config?: ProtectionConfig
) => {
  const ProtectedComponent: React.FC<P> = (props) => {
    return (
      <ProtectionProvider config={config}>
        <Component {...props} />
      </ProtectionProvider>
    );
  };

  ProtectedComponent.displayName = `withProtection(${Component.displayName || Component.name})`;
  return ProtectedComponent;
};

// Hook for conditional protection
export const useConditionalProtection = (condition: boolean, config?: ProtectionConfig) => {
  const [isEnabled, setIsEnabled] = useState(condition);
  
  useEffect(() => {
    setIsEnabled(condition);
  }, [condition]);

  const protection = useProtection(isEnabled ? config : {});

  return {
    isEnabled,
    enable: () => setIsEnabled(true),
    disable: () => setIsEnabled(false),
    ...protection
  };
};
