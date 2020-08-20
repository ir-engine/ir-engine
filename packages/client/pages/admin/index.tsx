import React from 'react';
import EmptyLayout from '../../components/ui/Layout/EmptyLayout';
import AdminConsole from '../../components/ui/Admin/AdminConsole';

export const AdminPage = (): any => {
  return (
    <EmptyLayout>
      <AdminConsole />
    </EmptyLayout>
  );
};

export default AdminPage;