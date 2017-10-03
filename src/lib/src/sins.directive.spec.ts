import {Component, QueryList, ViewChildren} from '@angular/core'
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms'
import {async, ComponentFixture, TestBed} from '@angular/core/testing'
import {SinModule} from './sin.module'
import {SinDirective} from './sin.directive'
import {By} from '@angular/platform-browser'


@Component({
  template: `
    <form [formGroup]="form">
      <label>
        <span>Username</span>
        <input type="text" formControlName="username">
      </label>
      <div class="errors" ngxSins="username">
        <div *ngxSin="'required'">Username is required</div>
        <div *ngxSin="'minlength'">Username is too short</div>
        <div *ngxSin="'maxlength'">Username is too long</div>
      </div>
    </form>
  `,
})
class TestComponent {
  form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(10)]],
  })

  @ViewChildren(SinDirective)
  listOfSins: QueryList<SinDirective>

  constructor(private fb: FormBuilder) {
  }
}


let fixture: ComponentFixture<TestComponent>


describe(`Sins Directive`, () => {

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ReactiveFormsModule, SinModule.forRoot()],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent)
    fixture.detectChanges()
  })

  it(`should pass control to sin children`, () => {
    expect(fixture.componentInstance.listOfSins.toArray().every(sin => {
      return sin.control == fixture.componentInstance.form.get('username')
    })).toBe(true)
  })

  it(`should work as expected`, () => {
    const getErrors = () =>
      fixture.debugElement.query(By.css('.errors')).nativeElement.innerText.trim()

    expect(getErrors()).toBe('', `no error initially`)

    fixture.componentInstance.form.get('username').markAsTouched()
    fixture.componentInstance.form.get('username').markAsDirty()
    fixture.detectChanges()
    expect(getErrors()).toBe('Username is required', `display required error`)

    fixture.componentInstance.form.get('username').setValue('123')
    fixture.detectChanges()
    expect(getErrors()).toBe('Username is too short', `display too short error`)

    fixture.componentInstance.form.get('username').setValue('this is way too long')
    fixture.detectChanges()
    expect(getErrors()).toBe('Username is too long', `display too long error`)
  })

})

