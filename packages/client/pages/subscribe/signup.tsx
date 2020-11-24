import React from 'react';
import EmptyLayout from '../../components/ui/Layout/EmptyLayout';
import dynamic from 'next/dynamic';
const Signup = dynamic(() => import('../../components/ui/Pricing'), { ssr: false });

export default function PricingPage() {
    return (
      <EmptyLayout>
        <Signup />
      </EmptyLayout>
    );
}
