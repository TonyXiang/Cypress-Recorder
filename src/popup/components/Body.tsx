import * as React from 'react';
import {
  RecState, Block, Settings, SingleSetting,
} from '../../types';

import CodeDisplay from './CodeDisplay';
import LandingBox from './LandingBox';
import SettingsBox from './SettingsBox';

export interface BodyProps {
  isValidTab: boolean,
  recStatus: RecState,
  codeBlocks: Block[],
  settings:Settings,
  destroyBlock: (index: number) => void,
  moveBlock: (dragIdx: number, dropIdx: number) => void,
  submitSingleSetting: (settings: SingleSetting) => void
}

export default ({
  recStatus,
  codeBlocks,
  isValidTab,
  settings,
  destroyBlock,
  moveBlock,
  submitSingleSetting,
}: BodyProps) => (
  <div id="body">
    { recStatus === 'settings' && <SettingsBox settings={settings} submitSingleSetting={submitSingleSetting} />}
    {recStatus === 'off' && <LandingBox isValidTab={isValidTab} />}
    {recStatus !== 'off' && <CodeDisplay codeBlocks={codeBlocks} destroyBlock={destroyBlock} moveBlock={moveBlock} />}
  </div>
);
