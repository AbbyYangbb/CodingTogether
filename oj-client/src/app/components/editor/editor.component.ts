import {Component, OnInit, Inject} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';

declare var ace: any; // global var - fixed way

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {

  editor: any;

  public languages: string[] = ['Java', 'C++', 'Python'];

  language: string = 'Java';

  output: string = '';

  defaultContent = {
    'Java': `public class Example{
      public static void main(String[] args){
        //Type your code here.

      }
    }`,
    'C++': `#include<iostream>
    using namespace std;

    int main(){
      //Type your C++ code here

      return 0;
    }`,
    'Python': `class Solution:
    def example():
        #Write your Python code here`
  };

  languageMap = new Map();

  sessionId: string;

  constructor(@Inject('collaboration') private collaboration,
              private route: ActivatedRoute,
              @Inject('auth') private auth,
              @Inject('data') private data) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.sessionId = params['id'];
      this.initEditor();
    })
  }

  initEditor() {
    this.editor = ace.edit('editor');
    this.editor.setTheme('ace/theme/eclipse');
    this.resetEditor();
    this.editor.$blockScrolling = Infinity;

    document.getElementsByTagName('textarea')[0].focus();

    this.collaboration.init(this.editor, this.sessionId);
    this.editor.lastAppliedChanged = null;

    //console.log(this.auth.authenticated());

      this.editor.on('change', (e) => {
        //console.log(JSON.stringify(e));
        e['userLogin']=this.auth.authenticated();
        if (this.editor.lastAppliedChanged != e) {
          this.collaboration.change(JSON.stringify(e));
        }
      })

      this.editor.getSession().getSelection().on("changeCursor", () => {
        let cursor = this.editor.getSession().getSelection().getCursor();
        //console.log('cursor moves: ' + JSON.stringify(cursor));
        cursor['userLogin']=this.auth.authenticated();
        this.collaboration.cursorMove(JSON.stringify(cursor));
      })    // to see whether the cursor move

      this.collaboration.restoreBuffer();

  }

  setLanguage(language: string): void {
    this.language = language;
    this.resetEditor();
  }

  resetEditor(): void {

    this.languageMap.set("java", "java");
    this.languageMap.set("c++", "c_cpp");
    this.languageMap.set("python", "python");

    this.editor.getSession().setMode(`ace/mode/${this.languageMap.get(this.language.toLowerCase())}`);
    this.editor.setValue(this.defaultContent[this.language]);

    this.output='';
  }

  submit(): void {
    let userCode = this.editor.getValue();
    let data={
      user_code : userCode,
      lang: this.language.toLowerCase()
    };

    this.data.buildAndRun(data)
      .then(res => this.output = res.text);
  }
}
