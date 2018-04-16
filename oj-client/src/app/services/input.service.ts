import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject'
import { Observable } from 'rxjs/Rx'

@Injectable()
export class InputService {

  private inputSubject$ = new BehaviorSubject<string>('');

  constructor() { }


  changeInput(term){    // get the value
    this.inputSubject$.next(term);
  }

  getInput(): Observable<string>{   // subscribe to the value - Observable
    return this.inputSubject$.asObservable();
  }   // if return inputSubject - you can, but it's a reference, easily changed by others;
}   // therefore, return Observable -
