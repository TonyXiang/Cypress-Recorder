import * as React from 'react';
import ToggleButton from './ToggleButton';
import ResetButton from './ResetButton';
import ClipboardButton from './ClipboardButton';
import SettingsButton from './SettingsButton';
import { ControlAction } from '../../constants';

export interface FooterProps {
  isValidTab: boolean,
  recStatus: string,
  handleToggle: (action: ControlAction) => void,
  toggleSettings: () => void,
  copyToClipboard: () => Promise<void>,
}

export default ({
  isValidTab,
  recStatus,
  handleToggle,
  toggleSettings,
  copyToClipboard,
} : FooterProps) => (
  <div id="footer">
    {recStatus !== 'settings' && <ToggleButton recStatus={recStatus} handleToggle={handleToggle} isValidTab={isValidTab} />}
    {recStatus === 'paused' && <ResetButton handleToggle={handleToggle} />}
    {recStatus === 'paused' && <ClipboardButton copyToClipboard={copyToClipboard} />}
    {(recStatus === 'off' || recStatus === 'settings') && <SettingsButton recStatus={recStatus} toggleSettings={toggleSettings} />}
  </div>
);
