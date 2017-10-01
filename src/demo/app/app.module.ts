import {NgModule} from '@angular/core'
import {ReactiveFormsModule} from '@angular/forms'
import {BrowserModule} from '@angular/platform-browser'
import {AppComponent} from './app.component'
import {SinModule} from 'ngx-sin'

@NgModule({
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    SinModule.forRoot({
      // tell ngx-sin when to show an error
      when: ({dirty, touched}) => dirty && touched,
    }),
  ],
  declarations: [
    AppComponent,
  ],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule {
}
