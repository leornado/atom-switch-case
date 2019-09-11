'use babel';

import SwitchCaseView from './switch-case-view';
import { CompositeDisposable } from 'atom';

const debug = getLogger('debug'),
  error = getLogger('error'),
  warn = getLogger('warn');

const notifyManager = atom.notifications;

function getLogger(level = 'info') {
  return (msg) => {
    if (msg) console[level](`ToggleCase: ${msg}!`);
  }
}

export default {

  switchCaseView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.switchCaseView = new SwitchCaseView(state.switchCaseViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.switchCaseView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'switch-case:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.switchCaseView.destroy();
  },

  serialize() {
    return {
      switchCaseViewState: this.switchCaseView.serialize()
    };
  },

  toggle() {
    debug('start');

    const editor = atom.workspace.getActiveTextEditor();
    if (editor) {
      const selectedText = editor.getSelectedText();
      if (selectedText) {
        debug(`find selected text = '${selectedText}'`);
        selectedText.toUpperCase() === selectedText ? editor.lowerCase() : editor.upperCase();
      } else notifyManager.addWarning('Not found selected text to toggle case.');
    } else debug('Can\'t get active text editor.');

    debug('finish');

    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
