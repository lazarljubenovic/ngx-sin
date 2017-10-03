// tslint:disable:max-line-length
import {Directive, DoCheck, EmbeddedViewRef, Inject, Input, isDevMode, OnInit, Optional, TemplateRef, ViewContainerRef} from '@angular/core'
import {AbstractControl} from '@angular/forms'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/merge'
import 'rxjs/add/observable/fromEvent'
import {SIN_CONFIG} from './sin-config'
import {WhenFunction, WhenObject} from './interfaces'
import {SinModuleConfig} from './sin.module'
import {SinsDirective} from './sins.directive'
// tsling:enable:max-line-length

@Directive({selector: '[ngxSin]'})
export class SinDirective implements OnInit, DoCheck, SinModuleConfig {

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
              @Inject(SIN_CONFIG) private config: SinModuleConfig,
              @Optional() private sinsDirective: SinsDirective) {
  }

  public ngOnInit(): void {
    if (this.sinsDirective) {
      this.control = this.sinsDirective.control
    }

    if (isDevMode() && this.control == null) {
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
      this.when = this.config.when;
    }

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
