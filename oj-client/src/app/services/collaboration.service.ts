import {Injectable, Inject} from '@angular/core';

import {COLORS} from '../../assets/colors';

declare let io: any;
declare let ace: any;

@Injectable()
export class CollaborationService {

  collaborationSocket: any;
  clientsInfo: Object = {};
  clientNum: number = 0;

  constructor(@Inject('auth') private auth) {
  }

  init(editor: any, sessionId: string): void {
    this.collaborationSocket = io(window.location.origin, {
      query: 'sessionId=' + sessionId
    });

    this.collaborationSocket.on("change", (delta: string) => {
      console.log("collaboration : editor changes by" + delta);
      delta = JSON.parse(delta);
      editor.lastAppliedChanged = delta;
      //if (this.auth.authenticated())  //Do not apply change, if not login
        editor.getSession().getDocument().applyDeltas([delta]);
    });

    this.collaborationSocket.on("cursorMove", (cursor: string) => {
      console.log("cursor move : " + cursor);
      let session = editor.getSession();
      cursor = JSON.parse(cursor);
      let x = cursor['row'];
      let y = cursor['column'];
      let changeClientId = cursor['socketId'];    // client's id
      console.log(changeClientId + " " + x + " " + y);

      if (changeClientId in this.clientsInfo) {  // to see whther the client in DB
        session.removeMarker(this.clientsInfo[changeClientId]['marker']);
      } else {
        this.clientsInfo[changeClientId] = {};

        let css = document.createElement("style");    // change the color
        css.type = "text/css";

        css.innerHTML = ".editor_cursor_" + changeClientId
          + "{ position: absolute; background:" + COLORS[this.clientNum] + ";"
          + " z-index:100; width:2px !important;}";   // small box as the marker

        //if(this.auth.authenticated())   //Do not apply change, if not login
          document.body.appendChild(css);
        this.clientNum++;
      }

      let Range = ace.require('ace/range').Range;
      let newMarker = session.addMarker(new Range(x, y, x, y + 1), 'editor_cursor_' + changeClientId, true);
      this.clientsInfo[changeClientId]['marker'] = newMarker;

    });


    //console test function
    this.collaborationSocket.on("message", (message: any) => {
      console.log("received:" + message);
    })
  }

  change(delta: string): void {
      this.collaborationSocket.emit("change", delta);
  }

  cursorMove(cursor: string): void {
      this.collaborationSocket.emit("cursorMove", cursor);
  }

  restoreBuffer(): void {
    //if (this.auth.authenticated())
      this.collaborationSocket.emit("restoreBuffer");
  }
}
