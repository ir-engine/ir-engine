import React from 'react';
import EmptyLayout from '@xr3ngine/client-core/components/ui/Layout/EmptyLayout';
import dynamic from 'next/dynamic';
const Signup = dynamic(() => import('@xr3ngine/client-core/components/ui/Pricing'), { ssr: false });

export default function PricingPage() {
    return (
      <EmptyLayout>
        <Signup />
      </EmptyLayout>
    );
}
