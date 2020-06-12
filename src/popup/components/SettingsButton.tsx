import * as React from 'react';

export interface SettingsButtonProps {
  recStatus: string,
  toggleSettings: () => void,
}

export default ({ recStatus, toggleSettings }: SettingsButtonProps) => (
  <div id="settings-wrap">
    <button type="button" id="settings" className="button" onClick={toggleSettings}>
      {recStatus === 'off' ? 'Settings!' : 'Cancel'}
    </button>
    {
      recStatus === 'settings'
      && (
      <button type="button" id="settings" className="button" onClick={toggleSettings}>
        Save
      </button>
      )
    }
  </div>
);
