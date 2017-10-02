import {
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Inject,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core'
import {AbstractControl} from '@angular/forms'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/merge'
import 'rxjs/add/observable/fromEvent'
import {SIN_CONFIG} from './sin-config'
import {WhenFunction, WhenObject} from './interfaces'
import {SinModuleConfig} from './sin.module'

@Directive({selector: '[ngxSin]'})
export class SinDirective implements DoCheck, SinModuleConfig {

  @Input('ngxSin') error: string

  private _control: AbstractControl

  @Input('ngxSinControl')
  public set control(control: AbstractControl) {
    this._control = control
    this.initialize()
  }

  public get control() {
    return this._control
  }

  private embeddedViewRef: EmbeddedViewRef<any>

  private initialized: boolean = false

  @Input('ngxSinWhen') when: WhenFunction

  constructor(private templateRef: TemplateRef<any>,
              private viewContainerRef: ViewContainerRef,
              @Inject(SIN_CONFIG) private config: SinModuleConfig) {
  }

  public ngDoCheck(): void {
    if (!this.initialized) {
      return
    }
    this.evaluate()
  }

  private initialize() {
    Object.assign(this, this.config)

    this.control.valueChanges
      .merge(this.control.statusChanges, ([value]: any[]) => value)
      .startWith(this.control.value)
      .subscribe(value => {
        this.evaluate()
      })

    this.initialized = true
  }

  private evaluate() {
    const whenObj: WhenObject = {
      disabled: this.control.disabled,
      dirty: this.control.dirty,
      enabled: this.control.enabled,
      invalid: this.control.invalid,
      pending: this.control.pending,
      pristine: this.control.pristine,
      touched: this.control.touched,
      untouched: this.control.untouched,
      valid: this.control.valid,
    }

    const hasError = this.control.hasError(this.error)
    const shouldDisplay = this.when(whenObj)

    if (hasError && shouldDisplay) {
      this.create()
    } else {
      this.destroy()
    }
  }

  private create() {
    if (this.embeddedViewRef == null) {
      this.embeddedViewRef = this.viewContainerRef
        .createEmbeddedView(this.templateRef, {$implicit: this.control.errors[this.error]})
    }
  }

  private destroy() {
    if (this.embeddedViewRef != null) {
      this.embeddedViewRef.destroy()
      this.embeddedViewRef = null
    }
  }

}