import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  Optional,
  QueryList,
  Renderer2,
  Self,
} from '@angular/core'
import {SinDirective, SinNotification} from './sin.directive'
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/add/operator/startWith'
import {ControlContainer, FormControlName, FormGroup} from '@angular/forms'

@Directive({selector: 'form'})
export class FormWithSinsDirective implements AfterContentInit {

  @ContentChildren(SinDirective, {descendants: true})
  public sinDirectives: QueryList<SinDirective>

  @ContentChildren(FormControlName, {descendants: true})
  public formControlNames: QueryList<FormControlName>

  @ContentChildren(FormControlName, {descendants: true, read: ElementRef})
  public formControlElRefs: QueryList<ElementRef>

  private destroy$ = new Subject()

  constructor(@Optional() @Self() private controlContainer: ControlContainer,
              private renderer: Renderer2,
              private elementRef: ElementRef) {
  }

  public ngAfterContentInit(): void {
    if (this.sinDirectives == null) {
      // This form does not have any sins
      return
    }
    this.sinDirectives.changes
      .startWith(this.sinDirectives)
      .takeUntil(this.destroy$)
      .subscribe(sinDirectives => {
        sinDirectives.forEach((sinDirective: SinDirective) => {
          sinDirective.errorChanges$
            .takeUntil(this.destroy$)
            .subscribe(({type, control}: SinNotification) => {
              const index = this.formControlNames.toArray()
                .findIndex(formControlName => {
                  return control == formControlName.control
                })

              let elRef: ElementRef

              if (index == -1) {
                const formGroup = this.controlContainer.control as FormGroup
                if (formGroup == control) {
                  elRef = this.elementRef
                }
              } else {
                elRef = this.formControlElRefs.toArray()[index]
              }

              if (type == 'add') {
                this.renderer.addClass(elRef.nativeElement, 'ngx-sin-invalid')
              } else if (type == 'remove') {
                this.renderer.removeClass(elRef.nativeElement, 'ngx-sin-invalid')
              }
            })
        })
      })

  }

  public ngOnDestroy() {

  }

}
