import * as React from 'react';
import { FormGroup, FormControlLabel, Switch } from '@material-ui/core';
import { Settings, SingleSetting } from '../../types/index';

export interface SettingsBoxProps {
  settings: Settings,
  submitSingleSetting: (settings: SingleSetting) => void,
}

export default ({ settings, submitSingleSetting }: SettingsBoxProps) => {
  const toggleSettings = (event: React.ChangeEvent<HTMLInputElement>):void => {
    submitSingleSetting({
      name: event.target.name,
      value: event.target.checked,
    });
  };

  return (
    <div id="settings-box">
      <FormGroup>
        <FormControlLabel
          control={<Switch name="waitXHR" checked={settings.waitXHR} onChange={toggleSettings} />}
          label="监听XHR请求"
        />
        <FormControlLabel
          control={<Switch name="flag" checked={settings.flag} onChange={toggleSettings} />}
          label="flag"
        />
      </FormGroup>
    </div>
  );
};
