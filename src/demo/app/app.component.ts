import {Component} from '@angular/core'
import {FormBuilder, Validators} from '@angular/forms'
import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/never'
import 'rxjs/add/observable/throw'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/timeoutWith'

export interface FormValue {
  username: string;
  email: string;
  password: string;
}

@Component({
  selector: 'demo-app',
  templateUrl: './app.component.html',
})
export class AppComponent {

  form = this.fb.group({
    username: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(16),
    ]],
    email: ['', [
      Validators.required,
      Validators.email,
    ]],
    password: ['', [
      Validators.required,
      Validators.minLength(4),
    ]],
  })

  constructor(private fb: FormBuilder) {
  }

  onSubmit() {
    /****************************************************************************
     * Check out ngx-common-forms to get rid of this whole boilerplate function *
     ****************************************************************************/

    if (this.form.invalid) {
      // Set all controls as dirty and touched to trigger visibility of errors
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key)
        control.markAsTouched()
        control.markAsDirty()
      })
      return
    }

    this.mockApi(this.form.value)
      .subscribe(
        (response: string) => {
          alert(response)
        },
        (errors) => {
          Object.keys(errors).forEach(key => {
            const control = this.form.get(key)
            control.setErrors({
              serverError: `Server error: ${errors[key]}`,
            })
            control.markAsDirty()
            control.markAsTouched()
          })
        },
      )
  }

  mockApi(value: FormValue): Observable<any> {
    if (value.username.toLowerCase().includes('test')) {
      return Observable.never().timeoutWith(1000, Observable.throw({
        'username': `A test? Seriously? Those are taken after first week of testing!`,
      }))
    }
    return Observable.of(`Welcome, ${value.username}`).delay(1000)
  }

}
