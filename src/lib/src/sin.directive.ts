// tslint:disable:max-line-length
import {
  Directive,
  DoCheck,
  EmbeddedViewRef,
  Inject,
  Input,
  isDevMode,
  OnInit,
  Optional,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core'
import {AbstractControl} from '@angular/forms'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/merge'
import 'rxjs/add/observable/fromEvent'
import {SIN_FULL_CONFIG} from './sin-config'
import {SinsDirective} from './sins.directive'
import {SinModuleConfig, WhenFunction, WhenObject} from './interfaces'
// tsling:enable:max-line-length

@Directive({selector: '[ngxSin]'})
export class SinDirective implements OnInit, DoCheck, SinModuleConfig {

  @Input('ngxSin') error: string

  private _controlWithErrors: AbstractControl
  private _control: AbstractControl

  @Input('ngxSinControl')
  public set control(control: AbstractControl) {
    this._control = control
    this.initialize()
  }

  public get control(): AbstractControl {
    return this._control
  }

  @Input('ngxSinErrorFromControl')
  public set controlWithErrors(control: AbstractControl) {
    this._controlWithErrors = control
  }

  public get controlWithErrors(): AbstractControl {
    return this._controlWithErrors || this.control
  }

  private embeddedViewRef: EmbeddedViewRef<any>

  private initialized: boolean = false

  @Input('ngxSinWhen') when: WhenFunction

  constructor(private templateRef: TemplateRef<any>,
              private viewContainerRef: ViewContainerRef,
              @Inject(SIN_FULL_CONFIG) private config: SinModuleConfig,
              @Optional() private sinsDirective: SinsDirective) {
  }

  public ngOnInit(): void {
    if (this.sinsDirective) {
      this.control = this.sinsDirective.control
    }

    if (isDevMode() && this.controlWithErrors == null) {
      throw new Error(`No control specified for ngxSin.`)
    }
  }

  public ngDoCheck(): void {
    if (!this.initialized) {
      return
    }
    this.evaluate()
  }

  private initialize() {
    if (this.when == null) {
      this.when = this.config.when
    }

    this.initialized = true
  }

  private evaluate() {
    const whenControl = this.control
    const whenObj: WhenObject = {
      disabled: whenControl.disabled,
      dirty: whenControl.dirty,
      enabled: whenControl.enabled,
      invalid: whenControl.invalid,
      pending: whenControl.pending,
      pristine: whenControl.pristine,
      touched: whenControl.touched,
      untouched: whenControl.untouched,
      valid: whenControl.valid,
    }

    const hasError = this.controlWithErrors.hasError(this.error)
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
        .createEmbeddedView(this.templateRef, {$implicit: this.controlWithErrors.errors[this.error]})
    }
  }

  private destroy() {
    if (this.embeddedViewRef != null) {
      this.embeddedViewRef.destroy()
      this.embeddedViewRef = null
    }
  }

}
