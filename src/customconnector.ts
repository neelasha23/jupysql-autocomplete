// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.

// Modified from jupyterlab/packages/completer/src/contextconnector.ts

import { CodeEditor } from '@jupyterlab/codeeditor';
import { DataConnector } from '@jupyterlab/statedb';
import { CompletionHandler } from '@jupyterlab/completer';

import { KernelModel } from './model';

import {
  ISessionContext
} from '@jupyterlab/apputils';

/**
 * A custom connector for completion handlers.
 */
export class CustomConnector extends DataConnector<
  CompletionHandler.IReply,
  void,
  CompletionHandler.IRequest
> {
  /**
   * Create a new custom connector for completion requests.
   *
   * @param options - The instatiation options for the custom connector.
   */
  constructor(options: CustomConnector.IOptions) {
    super();
    this._editor = options.editor;
    this._sessionContext = options.sessionContext;
  }

  /**
   * Fetch completion requests.
   *
   * @param request - The completion request text and details.
   * @returns Completion reply
   */
  fetch(
    request: CompletionHandler.IRequest
  ): Promise<CompletionHandler.IReply> {
    if (!this._editor) {
      return Promise.reject('No editor');
    }
    return new Promise<CompletionHandler.IReply>((resolve) => {
      resolve(Private.completionHint(this._editor, this._sessionContext));
    });
  }

  private _editor: CodeEditor.IEditor | null;
  private _sessionContext: ISessionContext | null;

}

/**
 * A namespace for custom connector statics.
 */
export namespace CustomConnector {
  /**
   * The instantiation options for cell completion handlers.
   */
  export interface IOptions {
    /**
     * The session used by the custom connector.
     */
    editor: CodeEditor.IEditor | null;
    sessionContext: ISessionContext | null;
  }

}

/**
 * A namespace for Private functionality.
 */
namespace Private {
  /**
   * Get a list of mocked completion hints.
   *
   * @param editor Editor
   * @returns Completion reply
   */
  export function completionHint(
    editor: CodeEditor.IEditor,
    sessionContext: ISessionContext,
  ): CompletionHandler.IReply {
    // Find the token at the cursor
    const cursor = editor.getCursorPosition();
    const token = editor.getTokenForPosition(cursor);

    const model = new KernelModel(sessionContext);

   
    /**const code = 
    `
    %%sql sqlite://
    CREATE TABLE languages(name, rating, change);
    INSERT INTO languages VALUES('Python', 1, 2);
    SELECT * FROM languages;
    `
    

    const code = 
    `
    a = 'hello'
    isinstance(a, str)
    `
    */

    const code = 
    `
    import sqlite3
    con = sqlite3.connect('/Users/neelashasen/Dev/jupysql_autocomplete/mydbtest')
    cursor = con.cursor()
    cursor.execute("SELECT name FROM sqlite_master where type='table'")
    cursor.fetchall()
    `

    console.log(model.execute(code))

    // Create a list of matching tokens.
    const tokenList = [
      { value: 'SELECT', offset: 0, type: 'sql' },
      { value: 'SELECT-ALL', offset: 0, type: 'sql' },
      { value: 'FROM', offset: 0, type: 'sql' },
      { value: 'CREATE', offset: 0, type: 'sql'},
      { value: 'CREATE TABLE', offset: 0, type: 'sql'},
      { value: 'CREATE DATABASE', offset: 0, type: 'sql'},
      { value: 'INSERT', offset: 0, type: 'sql'},
      { value: 'INSERT INTO', offset: 0, type: 'sql'},
      { value: 'VALUES', offset: 0, type: 'sql'},
    ];

    // Only choose the ones that have a non-empty type field, which are likely to be of interest.
    const completionList = tokenList.filter((t) => t.type).filter((t) => t.value.startsWith(token.value)).map((t) => t.value);
    // Remove duplicate completions from the list
    const matches = Array.from(new Set<string>(completionList));

    return {
      start: token.offset,
      end: token.offset + token.value.length,
      matches,
      metadata: {},
    };
  }
}
