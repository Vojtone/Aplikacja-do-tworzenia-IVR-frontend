import { Component } from '@angular/core';
import { CORE_DIRECTIVES } from '@angular/common';
import { Http, Headers } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';
import { LoggedInRouterOutlet } from '../app/LoggedInOutlet';
import { Changepassword } from '../changepassword/changepassword';
import { Deleteaccount } from '../deleteaccount/deleteaccount';
import { Projectlist } from '../projectlist/projectlist';
import { RouteConfig, RouterLink, Router } from '@angular/router-deprecated';

let template = require('./home.html');

@Component({
  selector: 'home',
  directives: [ CORE_DIRECTIVES, LoggedInRouterOutlet ],
  template: template
})

@RouteConfig([
  { path: '/project_list', component: Projectlist, as: 'Projectlist', useAsDefault: true },
  { path: '/change_password', component: Changepassword, as: 'Changepassword' },
  { path: '/delete_account', component: Deleteaccount, as: 'Deleteaccount' }
])


export class Home {
  jwt;
  decodedJwt;
  email: string;
  user_id: string;
  user_address: string;

  constructor(public router: Router, public http: Http, public authHttp: AuthHttp) {
    this.jwt = localStorage.getItem('jwt');
    if (this.jwt) {
      var q: any = window;
      this.decodedJwt = this.jwt && q.jwt_decode(this.jwt);
      this.user_id = this.decodedJwt.user;
      localStorage.setItem('user_id', this.user_id);
      this.user_address = 'http://localhost:3001/users/'.concat(this.user_id);
      localStorage.setItem('user_address', this.user_address);
    }
  }

  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('email');
    localStorage.removeItem('change_password_info');
    localStorage.removeItem('user_address');
    localStorage.removeItem('user_id');
    localStorage.removeItem('project_name');
    localStorage.removeItem('project_id');
    localStorage.removeItem('delete_project_info');
    this.router.parent.navigateByUrl('/login');
  }

  witaj() {
    if (this.email !== localStorage.getItem('email')) {
      this.email = localStorage.getItem('email');
    } else {
      this.email = '';
    }
    this.router.parent.navigateByUrl('/home/project_list');
  }

  go_to_change_password() {
    this.router.parent.navigateByUrl('/home/change_password');
  }

  go_to_delete_account() {
    this.router.parent.navigateByUrl('/home/delete_account');
  }

}
