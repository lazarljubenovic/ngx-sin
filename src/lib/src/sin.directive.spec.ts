import {Component} from '@angular/core'
import {AbstractControl, FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms'
import {ComponentFixture, TestBed} from '@angular/core/testing'
import {SinModule} from './sin.module'
import {By} from '@angular/platform-browser'

describe(`Sin Directive`, () => {

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

  describe(`with default when function`, () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [ReactiveFormsModule, SinModule.forRoot()],
      }).compileComponents()
    })

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

  describe(`usage of ngxSinName as a shortcut to ngxSinControl`, () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [ReactiveFormsModule, SinModule.forRoot({when: () => true})],
      }).overrideComponent(TestComponent, {
        set: {
          template: `
            <form [formGroup]="form">
              <label>
                <span>Username</span>
                <input type="text" formControlName="username">
              </label>
              <div *ngxSin="'required'; name: 'username'">Username is required</div>
            </form>
          `,
        },
      }).compileComponents()
    })

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

    it(`should appear when invalid, touched and pristine`, () => {
      testHost.form.get('username').markAsTouched()
      testHost.form.get('username').markAsDirty()
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(1)
    })

  })


  describe(`with custom when function provided through module`, () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [
          ReactiveFormsModule,
          SinModule.forRoot({when: ({dirty}) => dirty}),
        ],
      }).compileComponents()
    })

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

    beforeEach(() => {
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
          `,
        },
      }).compileComponents()
    })

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent)
      testHost = fixture.componentInstance
      fixture.detectChanges()
    })

    it(`should display error immediately`, () => {
      expect(fixture.debugElement.queryAll(By.css('div')).length).toBe(1)
    })

  })

  describe(`without a control`, () => {

    beforeEach(() => {
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
              <div *ngxSin="'required'">Username is required</div>
            </form>
          `,
        },
      }).compileComponents()
    })

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent)
    })

    it(`should throw`, () => {
      expect(() => fixture.detectChanges()).toThrow(new Error('No control specified for ngxSin.'))
    })

  })

})


function allEqual(...controlNames: string[]) {
  return function (control: AbstractControl) {
    if (controlNames.length == 0) {
      return null
    }

    const values = controlNames.map(name => control.get(name).value)
    const referenceValue = values[0]
    const areAllEqual = values.every(value => value == referenceValue)

    if (areAllEqual) {
      return null
    } else {
      return {allEqual: true}
    }
  }
}


describe(`Sin Directive`, () => {

  @Component({
    template: `
      <form [formGroup]="form">
        <input type="text" formControlName="username">
        <div class="username"
             *ngxSin="'username'; control: form.get('username')"
        >
          Username is required
        </div>
        <input type="password" formControlName="pwd1">
        <input type="password" formControlName="pwd2">
        <div class="allEqual"
             *ngxSin="'allEqual'; control: form"
        >
          Passwords don't match
        </div>
      </form>
    `,
  })
  class TestComponent {
    form = this.fb.group({
      username: ['', [Validators.required]],
      pwd1: [''],
      pwd2: [''],
    }, {
      validator: allEqual('pwd1', 'pwd2'),
    })

    constructor(private fb: FormBuilder) {
    }
  }

  let fixture: ComponentFixture<TestComponent>
  let testHost: TestComponent

  describe(`pizza!`, () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [
          ReactiveFormsModule,
          SinModule.forRoot(),
        ],
      }).compileComponents()
    })

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent)
      testHost = fixture.componentInstance
      fixture.detectChanges()
    })

    it(`should demonstrate a common problem`, () => {
      // because it tracks state of the group
      expect(fixture.debugElement.queryAll(By.css('div.username,div.allEqual')).length)
        .toBe(0, `no errors initially`)

      testHost.form.get('username').setValue('username')
      fixture.detectChanges()

      testHost.form.get('username').markAsDirty()
      fixture.detectChanges()

      // still did not blur
      expect(fixture.debugElement.queryAll(By.css('div.username')).length)
        .toBe(0, `no username error because its ok`)
      expect(fixture.debugElement.queryAll(By.css('div.allEqual')).length)
        .toBe(0, `no pwd errors before blurring away from username`)

      testHost.form.get('username').markAsTouched()
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div.username')).length)
        .toBe(0, `no username error because required is ok`)
      expect(fixture.debugElement.queryAll(By.css('div.allEqual')).length)
        .toBe(0, `no pwd error yet because '' == ''`)

      testHost.form.get('pwd1').setValue('q') // start typing
      testHost.form.get('pwd1').markAsDirty() // imitate how it'll actually work when user types
      fixture.detectChanges()
      expect(fixture.debugElement.queryAll(By.css('div.username')).length)
        .toBe(0, `no username error because required is ok`)
      expect(fixture.debugElement.queryAll(By.css('div.allEqual')).length)
        .toBe(1, `pwd already visible because 'q' != ''`)
    })

  })

})


describe(`Sin Directive`, () => {

  @Component({
    template: `
      <form [formGroup]="form">
        <input type="password" formControlName="pwd1">
        <div class="pwd1" *ngxSin="'required'; control: form.get('pwd1')">pwd1</div>
        <input type="password" formControlName="pwd2">
        <div class="pwd2" *ngxSin="'required'; control: form.get('pwd2')">pwd2</div>

        <div class="allEqual"
             *ngxSin="'allEqual'; control: form.get('pwd2'); errorFromControl: form"
        >
          Passwords don't match
        </div>
      </form>
    `,
  })
  class TestComponent {
    form = this.fb.group({
      pwd1: ['', [Validators.required]],
      pwd2: ['', [Validators.required]],
    }, {
      validator: allEqual('pwd1', 'pwd2'),
    })

    constructor(private fb: FormBuilder) {
    }
  }

  let fixture: ComponentFixture<TestComponent>
  let testHost: TestComponent

  describe(`track different control for getting error`, () => {

    beforeEach(() => {
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [
          ReactiveFormsModule,
          SinModule.forRoot(),
        ],
      }).compileComponents()
    })

    beforeEach(() => {
      fixture = TestBed.createComponent(TestComponent)
      testHost = fixture.componentInstance
      fixture.detectChanges()
    })

    it(`should should display error after blurring away from pwd2`, () => {
      testHost.form.get('pwd1').setValue('password')
      testHost.form.get('pwd1').markAsDirty()
      testHost.form.get('pwd1').markAsTouched()
      testHost.form.get('pwd2').setValue('passwor')
      testHost.form.get('pwd2').markAsDirty()

      fixture.detectChanges()
      expect(testHost.form.get('pwd2').dirty).toBe(true, `pwd2 is dirty`)
      expect(testHost.form.get('pwd2').untouched).toBe(true, `pwd2 is untouched`)
      expect(fixture.debugElement.queryAll(By.css('div.allEqual')).length)
        .toBe(0, `no error visible because pwd2 is still untouched`)
    })

  })

})

