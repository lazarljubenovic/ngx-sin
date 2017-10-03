// tslint:disable:no-shadowed-variable
import {Component} from '@angular/core'
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms'
import {async, ComponentFixture, TestBed} from '@angular/core/testing'
import {SinModule} from './sin.module'
import {By} from '@angular/platform-browser'

@Component({
  template: `
    <form [formGroup]="form">
      <label>
        <span>Username</span>
        <input type="text" formControlName="username">
      </label>
      <div *ngxSin="'required'; control: form.get('username')">Username is required</div>
    </form>
  `,
})
class TestComponent {
  form = this.fb.group({
    username: ['', [Validators.required]],
  })

  always = () => true

  constructor(private fb: FormBuilder) {
  }
}

let fixture: ComponentFixture<TestComponent>
let testHost: TestComponent

describe(`Sin Directive`, () => {

  describe(`with default when function`, () => {

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [ReactiveFormsModule, SinModule.forRoot()],
      }).compileComponents()
    }))

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent)
      testHost = fixture.componentInstance
      fixture.detectChanges()
    })

    it(`should not appear when valid`, () => {
      testHost.form.setValue({username: 'valid'})
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(0)
    })

    it(`should not appear when invalid but untouched and pristine`, () => {
      testHost.form.setValue({username: ''}) // invalid
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(0)
    })

    it(`should appear when invalid, touched and pristine`, () => {
      testHost.form.setValue({username: ''}) // invalid
      testHost.form.get('username').markAsTouched()
      testHost.form.get('username').markAsDirty()
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(1)
    })

    it(`should appear and disappear when error is fixed, and disappear again`, () => {
      testHost.form.setValue({username: ''}) // invalid
      testHost.form.get('username').markAsTouched()
      testHost.form.get('username').markAsDirty()
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(1, 'appeared after error')

      testHost.form.setValue({username: 'valid'})
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(0, 'disappeared')

      testHost.form.setValue({username: ''})
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(1, 'appeared again')
    })

  })


  describe(`with custom when function provided through module`, () => {

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [
          ReactiveFormsModule,
          SinModule.forRoot({when: ({dirty}) => dirty}),
        ],
      }).compileComponents()
    }))

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent)
      testHost = fixture.componentInstance
      fixture.detectChanges()
    })

    it(`should not display any errors initially`, () => {
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(0)
    })

    it(`should display error only after becoming dirty`, () => {
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(0, `no error when pristine`)

      testHost.form.get('username').markAsDirty()
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length)
        .toBe(1, `visible error when dirty`)
    })

  })


  describe(`with custom when function through input`, () => {

    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [ReactiveFormsModule, SinModule.forRoot()],
      }).overrideComponent(TestComponent, {
        set: {
          template: `
            <form [formGroup]="form">
              <label>
                <span>Username</span>
                <input type="text" formControlName="username">
              </label>
              <div *ngxSin="'required'; control: form.get('username'); when: always">
                Username is required
              </div>
            </form>
          `
        }
      }).compileComponents()
    }))

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent)
      testHost = fixture.componentInstance
      fixture.detectChanges()
    })

    it(`should display error immediately`, () => {
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(1)
    })

  })


})

