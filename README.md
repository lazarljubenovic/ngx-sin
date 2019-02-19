# DEPRECATED

# MERGED WITH https://github.com/lazarljubenovic/ngx-common-forms


# Sin

> **sin**
> 1. an immoral act considered to be a transgression against divine law.
> 2. to offend against a principle, standard, etc.
> 3. a shorter synonym for _error_ to make Angular templates less bloated

## Features

- Less bloat in templates when displaying errors.
- Globally configurable rule for _when_ should an error appear.
- Embraces reactive forms.

## Installation

```
# with npm
npm i ngx-sin

# with yarn
yarn ngx-sin
```

## Example usage

```typescript
form = this.fb.group({
  username: ['', [
    Validators.required,
    Validators.minLength(2),
    Validators.maxLength(16),
  ]],
  email: ['', [
    Validators.required,
    Validators.email,
  ]],
  password: ['', [
    Validators.required,
    Validators.minLength(4),
  ]],
})
```

```html
<form [formGroup]="form" (ngSubmit)="onSubmit()">

  <div>
    <label>
      <span>Username</span>
      <input type="text" formControlName="username">
    </label>
    <div ngxSins="username">
      <div *ngxSin="'required'">Username is required</div>
      <div *ngxSin="'minlength'">Username must be at least 2 characters long</div>
      <div *ngxSin="'maxlength'">Username must be at most 16 characters long</div>
      <div *ngxSin="'serverError'; let msg">{{ msg }}</div>
    </div>
  </div>

  <div>
    <label>
      <span>Email</span>
      <input type="email" formControlName="email">
    </label>
    <div ngxSins="email">
      <div *ngxSin="'required'">Email is required</div>
      <div *ngxSin="'email'">Your email seems invalid</div>
      <div *ngxSin="'serverError'; let msg">{{ msg }}</div>
    </div>
  </div>

  <div>
    <label>
      <span>Password</span>
      <input type="password" formControlName="password">
    </label>
    <div ngxSins="password">
      <div *ngxSin="'required'">Password is required</div>
      <div *ngxSin="'minlength'">What kind of short password is that?!</div>
      <div *ngxSin="'serverError'; let msg">{{ msg }}</div>
    </div>
  </div>

  <button type="submit">Register</button>

</form>
```

## Default `when` function

You can provide a `when` function through an input of a same name for each `ngxSin` directive to override the global configuration. The global configuration is provided through an object passed to `.forRoot` static function when importing the module.

The config object has the following interface.

```typescript
export interface SinModuleConfig {
  when: WhenFunction;
}
```

The function you provide is used to determine when should the error be shown, based on status of the control. The signature of this function is the following.

```typescript
export interface WhenObject {
  valid: boolean
  invalid: boolean
  pending: boolean
  enabled: boolean
  disabled: boolean
  pristine: boolean
  dirty: boolean
  touched: boolean
  untouched: boolean
}

export type WhenFunction = (whenObj: WhenObject) => boolean;
```

The default function is `({dirty, touched}) => dirty && touched`.

## Manually triggering errors when attemting to submit invalid form

This module deals only reducing boilerplate for the templates and centralizing the default behavior of when errors should appear. For less behavioral boilerplate, check out [`ngx-common-forms`](https://github.com/lazarljubenovic/ngx-common-forms).
