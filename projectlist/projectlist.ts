import { Component } from '@angular/core';
import { RouteConfig, Router, RouterLink } from '@angular/router-deprecated';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http, Headers } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { AuthHttp } from 'angular2-jwt';
import { contentHeader_content_type } from '../common/header_content_type';

let template = require('./projectlist.html');


@Component({
    selector: 'projectlist',
    directives: [CORE_DIRECTIVES],
    template: template
})

export class Projectlist {

  change_password_info = localStorage.getItem('change_password_info');
  delete_project_info = localStorage.getItem('delete_project_info');
  user_id = localStorage.getItem('user_id');
  project_name;
  project_id;
  empty_info: string;
  repeated_name_error: string;
  project_array = [];

  constructor(public router: Router, public authHttp: AuthHttp, public Http: Http) {

    let url = 'http://localhost:3001/users/' + this.user_id + '/projects';

    this.authHttp.get(url)
      .subscribe(
        response => {
          var model1 = JSON.stringify(response);
          var model2 = JSON.parse(model1);
          var model3 = JSON.parse(model2._body);
          for (var i = 0; i < model3.length; i++ ) {
          this.project_name = model3[i].project.title;
          this.project_id = model3[i].project.id;
          this.project_array.push({ name: this.project_name, id: this.project_id });
          }
          console.log(response);

          if (this.project_array.length === 0) {
          this.empty_info = 'Nie masz jeszcze żadnych projektów';
          }
        },
        error => {
          console.log(error);
          console.log('errooooor w get jest');
        }
      );

  }

  create_project(event, title) {
    event.preventDefault();
    let body = JSON.stringify({ title });
    let url = 'http://localhost:3001/users/' + this.user_id + '/projects';

    this.authHttp.post(url, body, { headers: contentHeader_content_type })
      .subscribe(
        response => {
          console.log(response);
          delete this.change_password_info;
          localStorage.removeItem('change_password_info');
          delete this.delete_project_info;
          localStorage.removeItem('delete_project_info');
          delete this.repeated_name_error;
          this.empty_info = '';

          console.log('create_project post zrobil sie dobrze');
          localStorage.setItem('jwt_project_id', response.json().jwt);
          localStorage.setItem('project_name', title);

          var jwt_project_id = response.json().jwt;
          if (jwt_project_id) {
              var q: any = window;
              var decodedJwt_id = jwt_project_id && q.jwt_decode(jwt_project_id);
              var project_idx = decodedJwt_id.project;
          }

          let body_nodes = [
          { node_id: '0', label: 'START', node_type: 'start', color: '#00cc00' },
          { node_id: '1', label: 'Pytanie 1', node_type: 'machine', color: '#ffb611' },
          { node_id: '2', label: 'Odpowiedź użytkownika 1', node_type: 'user', color: '#ffff99' },
          { node_id: '3', label: 'Odpowiedź użytkownika 2', node_type: 'user', color: '#ffff99' },
          { node_id: '4', label: 'Pytanie 2-1', node_type: 'machine', color: '#ffb611' },
          { node_id: '5', label: 'Pytanie 2-2', node_type: 'machine', color: '#ffb611' }
          ];

          let body_edges = [
          { edge_id: '0', from: '0', to: '1' },
          { edge_id: '1', from: '1', to: '2' },
          { edge_id: '2', from: '1', to: '3' },
          { edge_id: '3', from: '2', to: '4' },
          { edge_id: '4', from: '3', to: '5' }
          ];

          let url_nodes = 'http://localhost:3001/users/' + this.user_id +
          '/projects/' + project_idx + '/nodes';
          let url_edges = 'http://localhost:3001/users/' + this.user_id +
          '/projects/' + project_idx + '/edges';

          for (var i = 0; i < body_nodes.length; i++) {
            var body_node = JSON.stringify(body_nodes[i]);

            this.Http.post(url_nodes, body_node, { headers: contentHeader_content_type })
              .subscribe(
                response => {
                },
                error => {
                  console.log('error przy nodsach do bazy');
                  console.log(JSON.stringify(error));
                }
              );
          }

          for (var i = 0; i < body_edges.length; i++) {
            var body_edge = JSON.stringify(body_edges[i]);

            this.Http.post(url_edges, body_edge, { headers: contentHeader_content_type })
              .subscribe(
                response => {
                },
                error => {
                  console.log('error przy edgesach do bazy');
                  console.log(JSON.stringify(error));
                }
              );
          }

          var r = this.router;
          setTimeout(function() { r.parent.navigateByUrl('/project'); }, 500, r);
//Timeout, żeby baza danych nadążyła z zapisem, przed wczytaniem (jakieś lepsze rozwiązanie?)

        },
        error => {
          delete this.change_password_info;
          localStorage.removeItem('change_password_info');
          delete this.delete_project_info;
          localStorage.removeItem('delete_project_info');
          this.repeated_name_error = 'Projekt o takiej nazwie już istnieje.';
          console.log(error);
          console.log('errooooor w post jest');
        }
      );
  }

  load_project(event, project_name, project_id) {
    event.preventDefault();
    localStorage.setItem('project_name', project_name);
    localStorage.setItem('project_id', project_id);
    delete this.change_password_info;
    localStorage.removeItem('change_password_info');
    delete this.delete_project_info;
    localStorage.removeItem('delete_project_info');
    this.router.parent.navigateByUrl('/project');
  }
}
