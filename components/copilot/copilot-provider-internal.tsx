'use client';

import { CopilotKit } from '@copilotkit/react-core';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export function CopilotKitProviderWithUrl({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const useLiteModel = searchParams.get('use_lite_model') === 'true';

  const runtimeUrl = useMemo(() => {
    return useLiteModel ? '/api/copilotkitlitemodel' : '/api/copilotkit';
  }, [useLiteModel]);

  return (
    <CopilotKit runtimeUrl={runtimeUrl}>
      {children}
    </CopilotKit>
  );
} 