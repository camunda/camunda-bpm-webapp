import  { Injector} from '@angular/core';
import  { createCustomElement } from '@angular/elements';

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { HelloWorldComponent } from './hello-world/hello-world.component';

@NgModule({
  declarations: [
    HelloWorldComponent,
  ],
  imports: [
    BrowserModule
  ],
  entryComponents :  [
    HelloWorldComponent
 ]
})
export class AppModule {
  constructor(private injector : Injector){
    const el = createCustomElement(HelloWorldComponent, {injector : this.injector});
    customElements.define('hello-world',el);
  
  }
  ngDoBootstrap(){}
  }
