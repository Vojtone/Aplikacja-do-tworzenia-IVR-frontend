import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router-deprecated';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http, Headers } from '@angular/http';
import { contentHeaders } from '../common/headers';

let template = require('./login.html');

@Component({
  selector: 'login',
  directives: [RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES ],
  template: template
})

export class Login {

  error: string;
  message: string;
  signup_info = localStorage.getItem('signup_info');
  delete_account_info = localStorage.getItem('delete_account_info');
  // te 2 linijki (si, dai) przenosze nad konstr , bo byly pod, wiszac w powitrzu (sprawdz czy ok)

  constructor(public router: Router, public http: Http) {
  }

  login(event, email, password) {
    event.preventDefault();
    let body = JSON.stringify({ email, password });
    this.http.post('http://localhost:3001/login', body, { headers: contentHeaders })
      .subscribe(
        response => {
          localStorage.setItem('jwt', response.json().jwt);
          localStorage.setItem('email', email);
          localStorage.removeItem('signup_info');
          delete this.signup_info;
          localStorage.removeItem('delete_account_info');
          delete this.delete_account_info;

          this.router.parent.navigateByUrl('/home');
        },
        error => {
          localStorage.removeItem('signup_info');
          delete this.signup_info;
          localStorage.removeItem('delete_account_info');
          delete this.delete_account_info;

          this.message = 'Niepoprawny e-mail lub hasło';
          console.log(JSON.stringify(error));
        }
      );
  }

  signup(event) {
    event.preventDefault();
    this.router.parent.navigateByUrl('/signup');
  }
}
