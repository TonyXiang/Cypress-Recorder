import { generate } from 'shortid';
import { RecState, Block, Settings } from '../types';

export default class Model {
  status: RecState;

  processedCode: Block[];

  settings: Settings;

  constructor() {
    this.sync();
  }

  /**
   * Checks the data currently stored in Chrome local storage and performs logic based on current
   * recording status.
   */
  sync(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['status', 'codeBlocks', 'settings'], result => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else {
          if (result.status === 'on' || result.status === 'paused') {
            this.status = 'paused';
            this.processedCode = result.codeBlocks || [];
          } else {
            this.status = 'off';
            this.processedCode = [];
          }
          this.settings = result.settings || {
            waitXHR: false,
            flag: true,
          };
          chrome.storage.local.set({
            status: this.status, codeBlocks: this.processedCode, settings: this.settings,
          }, () => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve();
          });
        }
      });
    });
  }

  /**
   * Resets application to original state.
   */
  reset(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.status = 'off';
      this.processedCode = [];
      chrome.storage.local.set({ status: this.status, codeBlocks: this.processedCode }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Adds a codeblock to the array of code blocks and updates Chrome local storage.
   * @param block
   */
  pushBlock(block: string): Promise<Block> {
    return new Promise((resolve, reject) => {
      const newBlock: Block = {
        value: block,
        id: generate(),
      };
      this.processedCode.push(newBlock);
      chrome.storage.local.set({ codeBlocks: this.processedCode }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(newBlock);
      });
    });
  }

  addServer(block: string): Promise<Block> {
    return new Promise((resolve, reject) => {
      const exitServer = this.processedCode.find(item => item.value === block);
      if (exitServer) {
        resolve();
      }
      const newBlock: Block = {
        value: block,
        id: generate(),
      };
      this.processedCode.unshift(newBlock);
      chrome.storage.local.set({ codeBlocks: this.processedCode }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(newBlock);
      });
    });
  }

  addRoute(blocks: string[]): Promise<Block> {
    return new Promise((resolve, reject) => {
      const [atBlock, waitBlock] = blocks;

      const exitAtBlock = this.processedCode.find(item => item.value === atBlock);
      if (!exitAtBlock) {
        const newAtBlock: Block = {
          value: atBlock,
          id: generate(),
        };
        this.processedCode.splice(1, 0, newAtBlock);
      }

      const newWaitBlock: Block = {
        value: waitBlock,
        id: generate(),
      };
      this.processedCode.push(newWaitBlock);

      chrome.storage.local.set({ codeBlocks: this.processedCode }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve(newWaitBlock);
      });
    });
  }

  /**
   * Deletes a code block from the code display and updates Chrome local storage.
   * @param index
   */
  deleteBlock(index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.processedCode.splice(index, 1);
      chrome.storage.local.set({ codeBlocks: this.processedCode }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Allows the user to drag and drop code blocks to new positions in the array.
   * @param i
   * @param j
   */
  moveBlock(i: number, j: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const dragged = this.processedCode.splice(i, 1)[0];
      this.processedCode.splice(j, 0, dragged);
      chrome.storage.local.set({ codeBlocks: this.processedCode }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Updates the recording status and sends to the background.
   * @param newStatus
   */
  updateStatus(newStatus: RecState): Promise<void> {
    return new Promise((resolve, reject) => {
      this.status = newStatus;
      chrome.storage.local.set({ status: this.status }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Updates the settings.
   * @param settings
   */
  updateSettings(newSettings: Settings): Promise<void> {
    return new Promise((resolve, reject) => {
      this.settings = newSettings;
      chrome.storage.local.set({ settings: this.settings }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }

  /**
   * Updates the processedCode.
   * @param settings
   */
  updateCodeBlocks(blocks: Block[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.processedCode = blocks;
      chrome.storage.local.set({ codeBlocks: this.processedCode }, () => {
        if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
        else resolve();
      });
    });
  }
}
