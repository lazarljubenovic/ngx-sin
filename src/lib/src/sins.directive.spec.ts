import {Component, QueryList, ViewChildren} from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {SinModule} from './sin.module'
import {SinDirective} from './sin.directive'
import {By} from '@angular/platform-browser'


describe(`Sins Directive`, () => {

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ReactiveFormsModule, SinModule.forRoot()],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent)
    fixture.detectChanges()
  })

  it(`should pass control to sin children`, () => {
    expect(fixture.componentInstance.listOfSins.toArray().every(sin => {
      return sin.controlWithErrors == fixture.componentInstance.form.get('username')
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

const requiredWhenSiblingsSingleItem = (predicate: (value: any) => boolean) =>
  (sourceControlName: string, validateeControlName: string) => {
    return (group: AbstractControl): { [error: string]: any } | null => {
      const source = group.value[sourceControlName]
      const validatee = group.value[validateeControlName]

      if (predicate(source)) {
        const required = Validators.required(group.get(validateeControlName))
        if (required) {
          return {
            [`${validateeControlName}Required`]: true,
          }
        } else {
          return null
        }
      } else {
        return null
      }
    }
  }

export const requiredWhenSiblings = (predicate: (value: any) => boolean) =>
  (sourceControlName: string, validateeControlNames: string[] | string) => {
    if (typeof validateeControlNames === 'string') {
      return requiredWhenSiblingsSingleItem(predicate)(sourceControlName, validateeControlNames)
    } else {
      return (group: AbstractControl): { [error: string]: any } | null => {
        const errors = validateeControlNames.reduce((acc: Object, curr: string) => {
          return {
            ...acc,
            ...requiredWhenSiblingsSingleItem(predicate)(sourceControlName, curr)(group),
          }
        }, {})
        return Object.keys(errors).length == 0 ? null : errors
      }
    }
  }

describe(`Sins Directive`, () => {

  @Component({
    template: `
      <form [formGroup]="form">
        <label>
          <span>Username</span>
          <input type="text" formControlName="username">
        </label>
        <div class="errors" ngxSins="username">
          <div *ngxSin="'required'">::username We gotta know your name!</div>
        </div>

        <label>
          <span>Awesome</span>
          <input type="radio" formControlName="awesome" name="awesome" [value]="true">
          <input type="radio" formControlName="awesome" name="awesome" [value]="false">
        </label>
        <div class="errors" ngxSins="awesome">
          <div *ngxSin="'required'">::awesome You gotta tell us if you're awesome!</div>
        </div>

        <label>
          <span>Awesome scale</span>
          <input type="number" formControlName="awesomeScale">
        </label>
        <div class="errors" ngxSins="awesomeScale">
          <div *ngxSin="'awesomeScaleRequired'; errorFromControl: form">
            ::awesomeScale Now that we know you're awesome, you gotta tell us how much!
          </div>
        </div>
      </form>
    `,
  })
  class TestComponent {
    form = this.fb.group({
      username: ['', [Validators.required]],
      awesome: [null, [Validators.required]],
      awesomeScale: [null],
    }, {
      validator: requiredWhenSiblings(x => x === true)('awesome', 'awesomeScale'),
    })

    @ViewChildren(SinDirective)
    listOfSins: QueryList<SinDirective>

    constructor(private fb: FormBuilder) {
    }
  }

  let fixture: ComponentFixture<TestComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestComponent],
      imports: [ReactiveFormsModule, SinModule.forRoot()],
    }).compileComponents()
  })

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent)
    fixture.detectChanges()
  })

  it(`should correctly pull errors from another controls in combination with sins`, () => {
    const username = fixture.componentInstance.form.get('username') as FormControl
    const awesome = fixture.componentInstance.form.get('awesome') as FormControl
    const awesomeScale = fixture.componentInstance.form.get('awesomeScale') as FormControl

    const errors = fixture.debugElement.queryAll(By.css('.errors'))
    const hasError = (errorName: string): boolean =>
      errors.some(error => error.nativeElement.innerText.trim().startsWith(`::${errorName} `))

    expect(hasError('username') || hasError('awesome') || hasError('awesomeScale')).toBe(false)

    username.markAsDirty()
    username.markAsTouched()
    fixture.detectChanges()
    expect(hasError('awesome') || hasError('awesomeScale')).toBe(false)
    expect(hasError('username')).toBe(true, `Username error should be visible`)

    username.setValue('name')
    fixture.detectChanges()
    expect(hasError('username') || hasError('awesome') || hasError('awesomeScale')).toBe(false)

    awesome.setValue(true)
    awesome.markAsDirty()
    awesome.markAsTouched()
    fixture.detectChanges()
    expect(hasError('username') || hasError('awesome') || hasError('awesomeScale')).toBe(false)

    awesomeScale.markAsDirty()
    fixture.detectChanges()
    expect(hasError('username') || hasError('awesome') || hasError('awesomeScale')).toBe(false)

    awesomeScale.markAsTouched()
    fixture.detectChanges()
    expect(hasError('username') || hasError('awesome')).toBe(false)
    expect(hasError('awesomeScale')).toBe(true)

    awesomeScale.setValue(1)
    fixture.detectChanges()
    expect(hasError('username') || hasError('awesome') || hasError('awesomeScale')).toBe(false)
  })

})

