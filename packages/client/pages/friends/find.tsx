import React from 'react';

import EmptyLayout from '../../components/ui/Layout/EmptyLayout';
import UserList from '../../components/ui/Friends/UserList';

export const FriendsPage = (): any => {
  return (
    <EmptyLayout>
      <UserList />
    </EmptyLayout>
  );
};

export default FriendsPage;
