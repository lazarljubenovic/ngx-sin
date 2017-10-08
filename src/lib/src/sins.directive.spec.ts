import {Component, QueryList, ViewChildren} from '@angular/core'
import {AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms'
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

    const els = (css: string) => fixture.debugElement.queryAll(By.css(css))
    const errors = () => els('.errors')
    const hasSin = (errorName: string): boolean =>
      errors().some(error =>
        error.nativeElement.innerText.trim().startsWith(`::${errorName} `))

    expect(hasSin('username') || hasSin('awesome') || hasSin('awesomeScale'))
      .toBe(false, `No sin should be shown`)

    username.markAsDirty()
    username.markAsTouched()
    fixture.detectChanges()
    expect(hasSin('awesome') || hasSin('awesomeScale'))
      .toBe(false, `Awesome and AwesomeScale sins should not be shown`)
    expect(hasSin('username'))
      .toBe(true, `Username sin should be shown after marking the field as dirty and touched`)

    username.setValue('name')
    fixture.detectChanges()
    expect(hasSin('username') || hasSin('awesome') || hasSin('awesomeScale'))
      .toBe(false, `No sin should be shown after setting username to 'name'`)

    awesome.setValue(true)
    awesome.markAsDirty()
    awesome.markAsTouched()
    fixture.detectChanges()
    expect(hasSin('username') || hasSin('awesome') || hasSin('awesomeScale'))
      .toBe(false, `No sin should be shown after setting awesome to 'yes'`)

    awesomeScale.markAsDirty()
    fixture.detectChanges()
    expect(hasSin('username') || hasSin('awesome') || hasSin('awesomeScale'))
      .toBe(false, `No sin should be shown after marking awesome as dirty`)

    awesomeScale.markAsTouched()
    fixture.detectChanges()
    expect(hasSin('username') || hasSin('awesome'))
      .toBe(false, `Username and awesome sin should not be shown because they're valid`)
    expect(hasSin('awesomeScale'))
      .toBe(true, `AwesomeScale sin should be shown because it is touched and dirty yet invalid`)

    awesomeScale.setValue(1)
    fixture.detectChanges()
    expect(hasSin('username') || hasSin('awesome') || hasSin('awesomeScale'))
      .toBe(false, `No sin should be shown after the whole form is completed`)
  })

})


describe(`Sins Directive`, () => {

  @Component({
    template: `
      <form [formGroup]="form">
        <label>
          <span>Username</span>
          <input type="text" formControlName="username" name="username">
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
          <input type="number" formControlName="awesomeScale" name="awesomeScale">
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

  it(`correctly mark fields with an error class`, () => {
    const username = fixture.componentInstance.form.get('username') as FormControl
    const awesome = fixture.componentInstance.form.get('awesome') as FormControl
    const awesomeScale = fixture.componentInstance.form.get('awesomeScale') as FormControl

    const els = (css: string) => fixture.debugElement.queryAll(By.css(css))
    const hasSinClass = (name: string) => els(`input[name=${name}].ngx-sin-invalid`).length > 0

    expect(hasSinClass('username') || hasSinClass('awesome') || hasSinClass('awesomeScale'))
      .toBe(false, `No sin should be shown`)

    username.markAsDirty()
    username.markAsTouched()
    fixture.detectChanges()
    expect(hasSinClass('awesome') || hasSinClass('awesomeScale'))
      .toBe(false, `Awesome and AwesomeScale sins should not be shown`)
    expect(hasSinClass('username'))
      .toBe(true, `Username sin should be shown after marking the field as dirty and touched`)

    username.setValue('name')
    fixture.detectChanges()
    expect(hasSinClass('username') || hasSinClass('awesome') || hasSinClass('awesomeScale'))
      .toBe(false, `No sin should be shown after setting Username to 'name'`)

    awesome.setValue(true)
    awesome.markAsDirty()
    awesome.markAsTouched()
    fixture.detectChanges()
    expect(hasSinClass('username') || hasSinClass('awesome') || hasSinClass('awesomeScale'))
      .toBe(false, `No sin should be shown after setting Awesome to 'yes'`)

    awesomeScale.markAsDirty()
    fixture.detectChanges()
    expect(hasSinClass('username') || hasSinClass('awesome') || hasSinClass('awesomeScale'))
      .toBe(false, `No sin should be shown after marking Awesome as dirty`)

    awesomeScale.markAsTouched()
    fixture.detectChanges()
    expect(hasSinClass('username') || hasSinClass('awesome'))
      .toBe(false, `Username and Awesome sins should not be shown because they're valid`)
    expect(hasSinClass('awesomeScale'))
      .toBe(true, `AwesomeScale sin should be shown because it is touched and dirty yet invalid`)

    awesomeScale.setValue(1)
    fixture.detectChanges()
    expect(hasSinClass('username') || hasSinClass('awesome') || hasSinClass('awesomeScale'))
      .toBe(false, `No sin should be shown after the whole form is completed`)
  })

})


describe(`Sins Directive`, () => {

  @Component({
    template: `
      <form [formGroup]="form">
        <label>
          <span>Username</span>
          <input type="text" formControlName="username" name="username">
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

        <ng-container *ngIf="form.get('awesome').value === true">
          <label>
            <span>Awesome scale</span>
            <input type="number" formControlName="awesomeScale" name="awesomeScale">
          </label>
          <div class="errors" ngxSins="awesomeScale">
            <div *ngxSin="'awesomeScaleRequired'; errorFromControl: form">
              ::awesomeScale Now that we know you're awesome, you gotta tell us how much!
            </div>
          </div>
        </ng-container>
      </form>
    `,
    styles: [`.ngx-sin-invalid {background-color: red}`]
  })
  class TestComponent {
    form = this.fb.group({
      username: ['', [Validators.required]],
      awesome: [null, [Validators.required]],
      awesomeScale: [''],
    }, {
      validator: requiredWhenSiblings(x => x === true)('awesome', 'awesomeScale'),
    })

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

  it(`correctly mark fields with an error class when control appears after marking`, () => {
    const username = fixture.componentInstance.form.get('username') as FormControl
    const awesome = fixture.componentInstance.form.get('awesome') as FormControl
    const awesomeScale = fixture.componentInstance.form.get('awesomeScale') as FormControl
    const controls = [username, awesome, awesomeScale]

    const els = (css: string) => fixture.debugElement.queryAll(By.css(css))
    const hasSinClass = (name: string) => els(`input[name=${name}].ngx-sin-invalid`).length > 0

    expect(hasSinClass('username') || hasSinClass('awesome') || hasSinClass('awesomeScale'))
      .toBe(false, `No sin should be shown`)

    // Imitate unsuccessful submit
    controls.forEach(control => {
      control.markAsDirty()
      control.markAsTouched()
    })
    fixture.detectChanges()
    expect(hasSinClass('username') || hasSinClass('awesome'))
      .toBe(true, `Username and Awesome sins should be shown`)
    expect(hasSinClass('awesomeScale'))
      .toBe(false, `Awesome scale should not be shown because that whole part of form is hidden`)

    username.setValue('name')
    fixture.detectChanges()
    expect(hasSinClass('username')).toBe(false, `Username should not have a sin as it's valid`)
    expect(hasSinClass('awesome')).toBe(true, `Awesome sin should still be present`)
    expect(hasSinClass('awesomeScale')).toBe(false, `AwesomeScale is still hidden by app logic`)

    awesome.setValue(false)
    fixture.detectChanges()
    expect(hasSinClass('username')).toBe(false, `Username should not have a sin as it's valid`)
    expect(hasSinClass('awesome')).toBe(false, `Awesome sin is now valid`)
    expect(hasSinClass('awesomeScale')).toBe(false, `AwesomeScale is still hidden by app logic`)

    awesome.setValue(true)
    fixture.detectChanges()
    expect(hasSinClass('username')).toBe(false, `Username should not have a sin as it's valid`)
    expect(hasSinClass('awesome')).toBe(false, `Awesome sin is now valid`)
    expect(hasSinClass('awesomeScale'))
      .toBe(true, `AwesomeScale is shown by app logic along with an error`)
  })

})
