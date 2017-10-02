import {Component} from '@angular/core'
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms'
import {async, ComponentFixture, TestBed} from '@angular/core/testing'
import {SinModule} from './sin.module'
import {By} from '@angular/platform-browser'

describe(`Sin Directive`, () => {

  describe(`with default when function`, () => {

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

      constructor(private fb: FormBuilder) {
      }
    }

    let fixture: ComponentFixture<TestComponent>
    let testHost: TestComponent

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

  })


})

