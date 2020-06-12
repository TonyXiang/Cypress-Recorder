import * as React from 'react';
import Header from './Header';
import Info from './Info';
import Footer from './Footer';
import Body from './Body';
import {
  RecState, Block, ActionWithPayload, Settings, SingleSetting,
} from '../../types';
import { ControlAction } from '../../constants';
import '../../assets/styles/styles.scss';

export default () => {
  const defaultSettings = {
    waitXHR: false,
    flag: true,
  };
  const [recStatus, setRecStatus] = React.useState<RecState>('off');
  const [codeBlocks, setCodeBlocks] = React.useState<Block[]>([]);
  const [shouldInfoDisplay, setShouldInfoDisplay] = React.useState<boolean>(false);
  const [shouldWaitRequest, setShouldWaitRequest] = React.useState<boolean>(false);
  const [isValidTab, setIsValidTab] = React.useState<boolean>(true);
  const [settings, setSettings] = React.useState<Settings>(defaultSettings);

  const startRecording = (): void => {
    setRecStatus('on');
  };
  const stopRecording = (): void => {
    setRecStatus('paused');
  };
  const resetRecording = (): void => {
    setRecStatus('off');
    setCodeBlocks([]);
  };
  const saveSettings = (data: SingleSetting):void => {
    const newSettings = JSON.parse(JSON.stringify(settings));
    newSettings[data.name] = data.value;
    setSettings(newSettings);
    chrome.runtime.sendMessage({
      type: ControlAction.SETTINGS,
      payload: newSettings,
    });
  };

  React.useEffect((): void => {
    chrome.storage.local.get(['status', 'codeBlocks', 'settings'], result => {
      console.log(`popup.js useEffect: ${JSON.stringify(result.codeBlocks)}`);
      if (result.codeBlocks) setCodeBlocks(result.codeBlocks);
      if (result.status === 'on') setRecStatus('on');
      else if (result.status === 'paused') setRecStatus('paused');
      console.log(`popup.js useEffect: ${JSON.stringify(result.settings)}`);
      setSettings(result.settings || defaultSettings);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, activeTab => {
      if (activeTab[0].url.startsWith('chrome://')) setIsValidTab(false);
    });
  }, []);

  React.useEffect((): () => void => {
    function handleMessageFromBackground({ type, payload }: ActionWithPayload): void {
      setShouldInfoDisplay(false);
      if (type === ControlAction.START && isValidTab) startRecording();
      else if (type === ControlAction.STOP) stopRecording();
      else if (type === ControlAction.RESET) resetRecording();
      else if (type === ControlAction.UPDATE) {
        console.log(`popup.js UPDATE: ${JSON.stringify(payload)}`);
        setCodeBlocks(payload);
      }
    }
    chrome.runtime.onMessage.addListener(handleMessageFromBackground);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessageFromBackground);
    };
  }, []);

  const handleToggle = (action: ControlAction): void => {
    if (shouldInfoDisplay) setShouldInfoDisplay(false);
    if (action === ControlAction.START) startRecording();
    else if (action === ControlAction.STOP) stopRecording();
    else if (action === ControlAction.RESET) resetRecording();
    chrome.runtime.sendMessage({ type: action });
  };

  const toggleSettings = (): void => {
    setRecStatus(recStatus === 'off' ? 'settings' : 'off');
  };

  const toggleInfoDisplay = (): void => {
    setShouldInfoDisplay(should => !should);
  };

  const toggleWaitRequest = (): void => {
    setShouldWaitRequest(should => !should);
  };

  const copyToClipboard = async (): Promise<void> => {
    try {
      let toBeCopied: string = '';
      for (let i = 0; i !== codeBlocks.length; i += 1) {
        toBeCopied += codeBlocks[i].value.concat('\n');
      }
      await navigator.clipboard.writeText(toBeCopied);
    } catch (error) {
      throw new Error(error);
    }
  };

  const destroyBlock = (index: number): void => {
    setCodeBlocks(prevBlocks => prevBlocks.filter((block, i) => i !== index));
    chrome.runtime.sendMessage({
      type: ControlAction.DELETE,
      payload: index,
    });
  };

  const moveBlock = (dragIdx: number, dropIdx: number): void => {
    const temp = [...codeBlocks];
    const dragged = temp.splice(dragIdx, 1)[0];
    temp.splice(dropIdx, 0, dragged);
    setCodeBlocks(temp);
    chrome.runtime.sendMessage({
      type: ControlAction.MOVE,
      payload: { dragIdx, dropIdx },
    });
  };

  return (
    <div id="App">
      <Header shouldInfoDisplay={shouldInfoDisplay} toggleInfoDisplay={toggleInfoDisplay} />
      {
        (shouldInfoDisplay
          ? <Info shouldWaitRequest={shouldWaitRequest} toggleWaitRequest={toggleWaitRequest} />
          : (
            <Body
              codeBlocks={codeBlocks}
              recStatus={recStatus}
              isValidTab={isValidTab}
              settings={settings}
              destroyBlock={destroyBlock}
              moveBlock={moveBlock}
              submitSingleSetting={saveSettings}
            />
          )
        )
      }
      <Footer
        isValidTab={isValidTab}
        recStatus={recStatus}
        handleToggle={handleToggle}
        copyToClipboard={copyToClipboard}
        toggleSettings={toggleSettings}
      />
    </div>
  );
};
