// tslint:disable:max-line-length
import {AfterContentInit, ContentChildren, Directive, ElementRef, Optional, QueryList, Renderer2, Self} from '@angular/core'
import {SinDirective} from './sin.directive'
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/withLatestFrom'
import 'rxjs/add/operator/startWith'
import 'rxjs/add/operator/pairwise'
import 'rxjs/add/operator/map'
import 'rxjs/add/observable/combineLatest'
import 'rxjs/add/observable/zip'
import {AbstractControl, ControlContainer, FormControlName, FormGroup} from '@angular/forms'
import {Observable} from 'rxjs/Observable'
// tslint:enable:max-line-length

export type Pair<T> = [T, T]

export function findAdded<T>([olders, newers]: Pair<T[]>): T[] {
  return newers.filter(newer => olders.indexOf(newer) == -1)
}

export function findRemoved<T>([olders, newers]: Pair<T[]>): T[] {
  return findAdded([newers, olders])
}

@Directive({selector: 'form'})
export class FormWithSinsDirective implements AfterContentInit {

  @ContentChildren(SinDirective, {descendants: true})
  public sinDirectives: QueryList<SinDirective>

  @ContentChildren(FormControlName, {descendants: true})
  public formControlNames: QueryList<FormControlName>

  @ContentChildren(FormControlName, {descendants: true, read: ElementRef})
  public formControlElRefs: QueryList<ElementRef>

  private formControls: Observable<{ name: FormControlName, elRef: ElementRef }>

  private destroy$ = new Subject()

  private className: string = 'ngx-sin-invalid'

  constructor(@Optional() @Self() private controlContainer: ControlContainer,
              private renderer: Renderer2,
              private elementRef: ElementRef) {
  }

  private changeClassFor(control: AbstractControl, addClass: boolean): void {
    const index = this.formControlNames.toArray()
      .findIndex(formControlName => {
        return control == formControlName.control
      })

    let elRef: ElementRef

    if (index == -1) {
      const formGroup = this.controlContainer.control as FormGroup
      if (formGroup == control) {
        elRef = this.elementRef
      } else {
        // Could not find the FormControl in the view, do nothing
        return
      }
    } else {
      elRef = this.formControlElRefs.toArray()[index]
    }

    if (addClass) {
      this.renderer.addClass(elRef.nativeElement, this.className)
    } else {
      this.renderer.removeClass(elRef.nativeElement, this.className)
    }
  }

  private changeClassForAll(controls: AbstractControl[], addClass: boolean): void {
    controls.forEach(control => this.changeClassFor(control, addClass))
  }

  private removeAllClasses() {
    this.formControlElRefs.forEach(elRef => {
      this.renderer.removeClass(elRef.nativeElement, this.className)
    })
  }

  public ngAfterContentInit(): void {
    if (this.sinDirectives == null) {
      // This form does not have any sins
      return
    }

    this.formControls = Observable.zip(
      this.formControlNames.changes.startWith(this.formControlNames),
      this.formControlElRefs.changes.startWith(this.formControlElRefs),
      ([name, elRef]) => ({name, elRef})
    )

    const visibleSins$: Observable<AbstractControl[]> = this.sinDirectives.changes
      .startWith(this.sinDirectives)
      .map((list: QueryList<SinDirective>) => list.toArray())
      .switchMap((sins: SinDirective[]) =>
        Observable.combineLatest(sins.map(sin => sin.visible$)))
      .map((controls: AbstractControl[]) => controls.filter(control => control != null))

    this.formControls
      .withLatestFrom(this.sinDirectives.changes.startWith(this.sinDirectives), (fc, s) => s)
      .map((list: QueryList<SinDirective>) => list.toArray().map(sin => sin.visible$.getValue()))
      .map((controls: AbstractControl[]) => controls.filter(control => control != null))
      .withLatestFrom(visibleSins$, (_, sins) => sins)
      .subscribe((controls: AbstractControl[]) => {
        // When form controls on the page change, we grab the last info about
        // visible sins and use that. We have to be destructive here
        this.removeAllClasses()
        this.changeClassForAll(controls, true)
      })

    visibleSins$
      .pairwise()
      .subscribe(([oldControls, newControls]: Pair<AbstractControl[]>) => {
        // We can calculate diff instead of removing and setting everything.
        const added = findAdded([oldControls, newControls])
        const removed = findRemoved([oldControls, newControls])
        this.changeClassForAll(added, true)
        this.changeClassForAll(removed, false)
      })
  }

  public ngOnDestroy() {
    this.destroy$.next()
  }

}
