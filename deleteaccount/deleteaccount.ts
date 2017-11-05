import { Component } from '@angular/core';
import { RouteConfig, Router, RouterLink } from '@angular/router-deprecated';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http, Headers } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { AuthHttp } from 'angular2-jwt';
import { contentHeader_content_type } from '../common/header_content_type';


let template = require('./deleteaccount.html');


@Component({
    selector: 'deleteaccount',
    directives: [CORE_DIRECTIVES],
    template: template
})

export class Deleteaccount {

  error: string;
  json_errors;
  errors: string;
  user_address: string;

  constructor(public router: Router, public http: Http, public authHttp1: AuthHttp,
  public authHttp2: AuthHttp) {
    localStorage.removeItem('change_password_info');
    localStorage.removeItem('delete_project_info');
    this.user_address = localStorage.getItem('user_address');

  }

  delete_account(event, password, password_confirmation) {
    event.preventDefault();
    let body = JSON.stringify({ password, password_confirmation });

    this.authHttp1.post(this.user_address, body, { headers: contentHeader_content_type })
    .subscribe(
      resp => {
        this.authHttp2.delete(this.user_address)
        .subscribe(
           response => {
             localStorage.removeItem('jwt');
             localStorage.removeItem('email');
             localStorage.removeItem('change_password_info');
             localStorage.removeItem('user_address');
             localStorage.removeItem('user_id');
             localStorage.removeItem('delete_project_info');
             localStorage.setItem('delete_account_info', 'Konto zostało usunięte.');
             this.router.parent.navigateByUrl('/login');
             },
           error => {
             console.log(JSON.stringify(error));
           }
       );
      },
      err => {
          console.log(JSON.stringify(err));
          this.json_errors = JSON.parse(err._body).errors;
          console.log(this.json_errors);
          this.error = JSON.stringify((this.json_errors));
          this.errors = this.error.replace( /[,'""\[|\]]/g, '' );
      }
    );
  }
}
