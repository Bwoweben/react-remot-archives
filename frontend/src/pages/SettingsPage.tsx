import React from 'react';
import Card from '../components/common/Card';

const SettingsPage: React.FC = () => {
  return (
    <div>
      <h1>Settings</h1>
      <Card title="User Preferences">
        <p>Theme: Dark</p>
        <p>Notifications: Enabled</p>
      </Card>
    </div>
  );
};

export default SettingsPage;