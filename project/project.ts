import { Component } from '@angular/core';
import { RouteConfig, Router, RouterLink } from '@angular/router-deprecated';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from '@angular/common';
import { Http, Headers } from '@angular/http';
import { contentHeaders } from '../common/headers';
import { AuthHttp } from 'angular2-jwt';
import { contentHeader_content_type } from '../common/header_content_type';
import { OnInit } from '@angular/core';

declare var vis;

let template = require('./project.html');
declare function clusterByConnection();

@Component({
    selector: 'project',
    directives: [CORE_DIRECTIVES],
    template: template
})

export class Project {

    user_id = localStorage.getItem('user_id');
    project_name: string;
    project_id: string;
    jwt_project_id;
    decodedJwt_id;
    nodes_data; //idzie do railsów
    edges_data; //idzie do railsów
    clusters_data; //idzie do railsów

    node_id;
    node_label;
    node_type;
    node_color;
    edge_id;
    edge_from;
    edge_to;
    cluster_id;
    cluster_key;

    network;
    data;
    selected_node_id = '';

    //configuration
    voip_login_get: string;
    voip_password_get: string;
    domain_get: string;
    ip_get: string;
    phone_get: string;

    constructor(public router: Router, public authHttp: AuthHttp, public Http: Http,
    public authHttp2: AuthHttp, public authHttp3: AuthHttp, public authHttp4: AuthHttp,
    public authHttp5: AuthHttp, public authHttp6: AuthHttp) {

        this.nodes_data = [];
        this.edges_data = [];
        this.clusters_data = [];

        this.project_name = localStorage.getItem('project_name');
        this.project_id = localStorage.getItem('project_id');
        this.jwt_project_id = localStorage.getItem('jwt_project_id');
        if (this.jwt_project_id) {
            var q: any = window;
            this.decodedJwt_id = this.jwt_project_id && q.jwt_decode(this.jwt_project_id);
            this.project_id = this.decodedJwt_id.project;
        }

        let url = 'http://localhost:3001/users/' + this.user_id + '/projects/' +
        this.project_id + '/voip_accounts';
        this.authHttp.get(url)
        .subscribe(
            response => {
            var model1 = JSON.stringify(response);
            var model2 = JSON.parse(model1);
            var model3 = JSON.parse(model2._body);
            this.voip_login_get = model3.voip_account.voip_login;
            this.voip_password_get = model3.voip_account.password;
            this.domain_get = model3.voip_account.domain;
            this.ip_get = model3.voip_account.ip;
            this.phone_get = model3.voip_account.phone;

            },
            error => {
            console.log(error);
            console.log('errooooor w get configuration jest');
            }
        );

        let url_nodes = 'http://localhost:3001/users/' + this.user_id + '/projects/'
        + this.project_id + '/nodes' ;
        let url_edges = 'http://localhost:3001/users/' + this.user_id + '/projects/'
        + this.project_id + '/edges' ;
        let url_clusters = 'http://localhost:3001/users/' + this.user_id + '/projects/'
        + this.project_id + '/clusters' ;

        this.authHttp.get(url_nodes)
        .subscribe(
            response => {
                var model1 = JSON.stringify(response);
                var model2 = JSON.parse(model1);
                var model3 = JSON.parse(model2._body);
                for (var i = 0; i < model3.length; i++ ) {
                    this.node_id = model3[i].node.node_id;
                    this.node_label = model3[i].node.label;
                    this.node_type = model3[i].node.node_type;
                    this.node_color = model3[i].node.color;
                    this.nodes_data.push( { id: this.node_id, label: this.node_label,
                        node_type: this.node_type, color: this.node_color } );
                }
                console.log('nody z geta');
                console.log(this.nodes_data);
            },
            error => {
                console.log(error);
                console.log('error w get nodes jest');
            },
            () => {
                this.authHttp.get(url_edges)
                .subscribe(
                    response => {
                        var model1 = JSON.stringify(response);
                        var model2 = JSON.parse(model1);
                        var model3 = JSON.parse(model2._body);
                        for (var i = 0; i < model3.length; i++ ) {
                            this.edge_id = model3[i].edge.edge_id;
                            this.edge_from = model3[i].edge.from;
                            this.edge_to = model3[i].edge.to;
                            this.edges_data.push( { id: this.edge_id, from: this.edge_from,
                                to: this.edge_to } );
                        }
                        console.log('edgesy z geta');
                        console.log(this.edges_data);
                    },
                    error => {
                        console.log(error);
                        console.log('error w get edges jest');
                    },
                    () => {
                        this.authHttp.get(url_clusters)
                        .subscribe(
                            response => {
                                var model1 = JSON.stringify(response);
                                var model2 = JSON.parse(model1);
                                var model3 = JSON.parse(model2._body);
                                for (var i = 0; i < model3.length; i++ ) {
                                    this.cluster_id = model3[i].cluster.cluster_id;
                                    this.cluster_key = model3[i].cluster.key;
                                    this.clusters_data.push( { id: this.cluster_id,
                                        key: this.cluster_key} );
                                }
                                console.log('clustery z geta');
                                console.log(this.clusters_data);
                            },
                            error => {
                                console.log(error);
                                console.log('error w get clusters jest');
                            },
                            () => {
                                this.vis_init();
                            }
                        );
                    }
                );
            }
        );
    }

    update_config(event, voip_login, password, domain, ip, phone) {
        event.preventDefault();
        let body = JSON.stringify({ voip_login, password, domain, ip, phone });
        let url = 'http://localhost:3001/users/' + this.user_id + '/projects/' +
        this.project_id + '/voip_accounts';
        this.authHttp.patch(url, body, { headers: contentHeader_content_type })
            .subscribe(
                response => {
                console.log('patch configuration ok');
                alert('Dane zostały zaktualizowane.');
                },
                error => {
                console.log('patch configuration error');
                console.log(error);
                console.log(JSON.stringify(error));
                }
            );
    }

    go_to_project_list() {
        localStorage.removeItem('project_name');
        localStorage.removeItem('project_id');
        localStorage.removeItem('jwt_project_id');
        this.router.navigateByUrl('/home/project_list');
    }

    logout() {
        localStorage.removeItem('jwt');
        localStorage.removeItem('email');
        localStorage.removeItem('user_address');
        localStorage.removeItem('user_id');
        localStorage.removeItem('project_name');
        localStorage.removeItem('project_id');
        localStorage.removeItem('jwt_project_id');
        this.router.parent.navigateByUrl('/login');
    }

    delete_project() {
        let url = 'http://localhost:3001/users/' + this.user_id + '/projects/' + this.project_id;

            this.authHttp.delete(url)
            .subscribe(
                response => {
                    localStorage.removeItem('project_name');
                    localStorage.removeItem('project_id');
                    localStorage.removeItem('jwt_project_id');
                    localStorage.setItem('delete_project_info', 'Projekt został usunięty.');
                    this.router.parent.navigateByUrl('/home/project_list');
                    },
                error => {
                    console.log(JSON.stringify(error));
                }
        );
    }

    save_project() {
        var nodes_to_ruby = [];
        var edges_to_ruby = [];
        var clusters_to_ruby = [];

        var n_id;
        var n_label;
        var n_type;
        var n_color;

        var e_id;
        var e_from;
        var e_to;

        var c_id;
        var c_key;

        var n_save_ok = false;
        var e_save_ok = false;
        var c_save_ok = false;

        var model_n = this.nodes_data;
        for (var i = 0; i < model_n.length; i++ ) {
            n_id = model_n[i].id;
            n_label = model_n[i].label;
            n_type = model_n[i].node_type;
            n_color = model_n[i].color;
            nodes_to_ruby.push({ node_id: n_id, label: n_label,
                node_type: n_type, color: n_color });
        }
        //console.log(nodes_to_ruby); 
        //console.log(JSON.stringify(nodes_to_ruby));

        var model_e = this.edges_data;
        for (var i = 0; i < model_e.length; i++ ) {
            e_id = model_e[i].id;
            e_from = model_e[i].from;
            e_to = model_e[i].to;
            edges_to_ruby.push({ edge_id: e_id, from: e_from, to: e_to });
        }
        //console.log(edges_to_ruby); 
        //console.log(JSON.stringify(edges_to_ruby));

        var model_c = this.clusters_data;
        for (var i = 0; i < model_c.length; i++ ) {
            c_id = model_c[i].id;
            c_key = model_c[i].key;
            clusters_to_ruby.push({ cluster_id: c_id, key: c_key });
        }
        //console.log(clusters_to_ruby); 
        //console.log(JSON.stringify(clusters_to_ruby));

        let url_nodes = 'http://localhost:3001/users/' + this.user_id + '/projects/'
        + this.project_id + '/nodes' ;
        let url_edges = 'http://localhost:3001/users/' + this.user_id + '/projects/'
        + this.project_id + '/edges' ;
        let url_clusters = 'http://localhost:3001/users/' + this.user_id + '/projects/'
        + this.project_id + '/clusters' ;

        this.authHttp.delete(url_nodes)
        .subscribe(
            response => {
                console.log('usunięcie nodesow udane');

                for (var i = 0; i < nodes_to_ruby.length; i++) {
                    var body_node = JSON.stringify(nodes_to_ruby[i]);
                    this.authHttp2.post(url_nodes, body_node,
                    { headers: contentHeader_content_type }) //authhttp / http ?
                    .subscribe(
                        response => {
                            //console.log('node do bazy ok');
                        },
                        error => {
                            console.log('error przy zapisie nodesow do bazy');
                            console.log(JSON.stringify(error));
                        }
                        );
                }
                n_save_ok = true;
            },
            error => {
                console.log('error przy usuwaniu nodesow');
                console.log(JSON.stringify(error));
            },
            () => {
                this.authHttp3.delete(url_edges)
                .subscribe(
                    response => {
                        console.log('usunięcie edgesów udane');

                        for (var i = 0; i < edges_to_ruby.length; i++) {
                            var body_edge = JSON.stringify(edges_to_ruby[i]);
                            this.authHttp4.post(url_edges, body_edge,
                            {headers: contentHeader_content_type}) //authhttp / http ?
                            .subscribe(
                                response => {
                                    //console.log('edge do bazy ok');
                                },
                                error => {
                                    console.log('error przy zapisie edgesów do bazy');
                                    console.log(JSON.stringify(error));
                                }
                                );
                        }
                        e_save_ok = true;
                    },
                    error => {
                        console.log('error przy usuwaniu edgesow z bazy');
                        console.log(JSON.stringify(error));
                    },
                    () => {
                        this.authHttp5.delete(url_clusters)
                        .subscribe(
                            response => {
                                console.log('usunięcie clusterów udane');

                                for (var i = 0; i < clusters_to_ruby.length; i++) {
                                    var body_cluster = JSON.stringify(clusters_to_ruby[i]);
                                    this.authHttp6.post(url_clusters, body_cluster,
                                    {headers: contentHeader_content_type}) //authhttp / http ?
                                    .subscribe(
                                        response => {
                                            //console.log('cluster do bazy ok');
                                        },
                                        error => {
                                            console.log('error przy zapisie clusterów do bazy');
                                            console.log(JSON.stringify(error));
                                        }
                                    );
                                }
                                c_save_ok = true;
                            },
                            error => {
                                console.log('error przy usuwaniu clusterów z bazy');
                                console.log(JSON.stringify(error));
                            },
                            () => {
                                if (n_save_ok === true && e_save_ok === true &&
                                c_save_ok === true) {
                                    alert('Projekt został zapisany.');
                                    n_save_ok = false;
                                    e_save_ok = false;
                                    c_save_ok = false;
                                }
                            }
                        );
                    }
                );
            }
        );
    }

    vis_init() {

        var nodes;
        var edges;
        var container;
        var data;
        var options;
        var network;

        var locales = {
            pl: {
                edit: 'Edytuj',
                del: 'Usuń',
                back: 'Powrót',
                addNode: 'Dodaj bloczek',
                addEdge: 'Dodaj połączenie',
                editNode: 'Edytuj bloczek',
                editEdge: 'Edytuj połączenie',
                addDescription: 'Kliknij na wolnej przestrzeni by dodać bloczek.',
                edgeDescription: 'Kliknij i przeciągnij połączenie między dwoma bloczkami.',
                editEdgeDescription: 'Kliknij i przeciągnij kropkę na inny bloczek.',
                createEdgeError: 'Nie możesz stworzyć połączenia od/do grupy bloczków.',
                deleteClusterError: 'Nie można usunąć grupy bloczków.',
                editClusterError: 'Nie można edytować grupy bloczków.'
            }
        };

        // create an array with nodes
        nodes = new vis.DataSet(this.nodes_data);

        // create an array with edges
        edges = new vis.DataSet(this.edges_data);

        // create a network
        container = document.getElementById('mynetwork');

        // provide the data in the vis format
        this.data = {
            nodes: nodes,
            edges: edges
        };

        options = {
            locale: 'pl',
            locales: locales,

// -------------------- manipulation -----------------------

manipulation: {
    enabled: true,
    addNode: (nodeData, callback) => {
            var label = (<HTMLInputElement>document.getElementById('node-label')).value;
            nodeData.label = label;

            var node_type = (<HTMLSelectElement>document.getElementById('select_node_type')).value;
            if (node_type === 'Bloczek automatu') {
                nodeData.node_type = 'machine';
                nodeData.color = '#ffb611';
                //var options = {nodes: { color: { background: '#111'}}}
                //network.setOptions(options);
            }
            if (node_type === 'Bloczek użytkownika') {
                nodeData.node_type = 'user';
                nodeData.color = '#ffff99';
            }
            if (node_type === 'Bloczek przekierowania') {
                nodeData.node_type = 'redirect';
                nodeData.color = '#cc6699';
            }
            if (node_type === 'Bloczek stop') {
                nodeData.node_type = 'stop';
                nodeData.color = '#ff3333';
                nodeData.label = 'STOP';
            }

            callback(nodeData);
            //console.log('----- data');
            //console.log(data);
            //console.log('----- nodes');
            //console.log((data.nodes)._data);
            //console.log('----- edges');
            //console.log((data.edges)._data);
            //console.log('----- ####');

            var idx = nodeData.id;
            var labelx = nodeData.label;
            var typex = nodeData.node_type;
            var colorx = nodeData.color;
            (this.nodes_data).push({ id: idx, label: labelx, node_type: typex, color: colorx });
            console.log(this.nodes_data);
            },

    addEdge: (edgeData, callback) => {
        //połączenie z x do stopa powinno być jednoznaczne? // od przekierowania?
        var node_id_from = edgeData.from;
        var node_id_to = edgeData.to;
        var node_type_from;
        var node_type_to;
        var multiple_connections_from_user_type = false;
        var to_start = false;
        var multiple_start_connection = false;
        var start_not_to_machine = false;
        var from_stop = false;

        for (var i = 0; i < this.nodes_data.length; i++ ) {
            if (this.nodes_data[i].id === node_id_from) {
                node_type_from = this.nodes_data[i].node_type;
            }
            if (this.nodes_data[i].id === node_id_to) {
                node_type_to = this.nodes_data[i].node_type;
            }
        }

        for (var i = 0; i < this.nodes_data.length; i++ ) { //uniemożliwienie połączenia od stopu
            if (this.nodes_data[i].id === node_id_from &&
            this.nodes_data[i].node_type === 'stop') {
                from_stop = true;
            }
        }
        if (from_stop === true) {
            alert('Nie możesz dodać połączenia od bloczka stopu.');
            callback();
            from_stop = false;

        } else { //uniemożliwienie połączenia do startu

            if (node_type_from === 'start' || node_type_to === 'start') {

                for (var i = 0; i < this.nodes_data.length; i++ ) {
                    if (this.nodes_data[i].id === node_id_to &&
                    this.nodes_data[i].node_type === 'start') {
                        to_start = true;
                    }
                }
            }
            if (to_start === true) {
                alert('Nie możesz dodać połączenia prowadzącego do bloczka startu.');
                callback();
                to_start = false;

            } else { //uniemożliwienie dodania więcej niż jednego połączenia od startowego

                if (node_type_from === 'start' || node_type_to === 'start') {
                    var counter = 0;
                    for (var i = 0; i < this.nodes_data.length; i++ ) {
                        if (this.nodes_data[i].node_type === 'start') {
                            for (var q = 0; q < this.edges_data.length; q++) {
                                if (this.edges_data[q].from === this.nodes_data[i].id ||
                                this.edges_data[q].to === this.nodes_data[i].id) {
                                    counter++;
                                    if (counter >= 1) {
                                        multiple_start_connection = true;
                                    }
                                }
                            }
                        }
                    }
                }
                if (multiple_start_connection === true) {
                    alert('Nie może istnieć więcej niż jedno połączenie od bloczka startu.');
                    callback();
                    multiple_start_connection = false;

                } else { //musi być od startu do automatu

                    if (node_type_from === 'start' || node_type_to === 'start') {
                        for (var i = 0; i < this.nodes_data.length; i++) {
                            if (this.nodes_data[i].id === node_id_to &&
                            this.nodes_data[i].node_type !== 'machine') {
                                start_not_to_machine = true;
                            }
                        }
                    }
                    if (start_not_to_machine === true) {
                        alert('Połączenie od startu musi prowadzić do bloczka automatu.');
                        callback();
                        start_not_to_machine = false;

                    } else { //niejednoznaczne połączenie od user node

                        for (var i = 0; i < this.nodes_data.length; i++ ) {
                            if (this.nodes_data[i].id === node_id_from &&
                            this.nodes_data[i].node_type === 'user') {
                                for (var q = 0; q < this.edges_data.length; q++) {
                                    if (this.edges_data[q].from === this.nodes_data[i].id) {
                                        multiple_connections_from_user_type = true;
                                    }
                                }
                            }
                        }
                        if (multiple_connections_from_user_type === true) {
                            alert('Może wystąpić tylko jedno połączenie z bloczka użytkownika.');
                            callback();
                            multiple_connections_from_user_type = false;

                        } else { //połączenie do samego siebie

                            if (edgeData.from === edgeData.to) {
                                alert('Nie możesz podłączyć bloczka do siebie samego.');

                            } else { //połączenie nodów tego samego typu

                                if (node_type_from === node_type_to) {
                                  alert('Nie możesz połączyć dwóch bloczków tego samego rodzaju.');

                                } else { //połączenie już istnieje

                                    var connection_exist = false;

                                    for (var i = 0; i < this.edges_data.length; i++ ) {
                                        if (this.edges_data[i].from === node_id_from &&
                                        this.edges_data[i].to === node_id_to) {
                                            connection_exist = true;
                                        }
                                    }
                                    if (connection_exist === true) {
                                        alert('Takie połączenie już istnieje.');
                                        connection_exist = false;

                                    } else { //wszystko ok

                                        callback(edgeData);

                                        var idx = edgeData.id;
                                        var fromx = edgeData.from;
                                        var tox = edgeData.to;
                                        (this.edges_data).push({ id: idx, from: fromx, to: tox });
                                        console.log(this.edges_data);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    editNode: (nodeData, callback) => {
        if (nodeData.node_type === 'start' ||
        nodeData.node_type === 'stop') { //brak możliwości edycji startu / stopu
            callback();

        } else {

            var label = (<HTMLInputElement>document.getElementById('node-label')).value;
            nodeData.label = label;
            callback(nodeData);

            for (var i = 0; i < this.nodes_data.length; i++ ) {
                if (this.nodes_data[i].id === nodeData.id) {
                    this.nodes_data[i].label = label;
                }
            }
        }
    },
    editEdge: (edgeData, callback) => {
        var node_id_from = edgeData.from;
        var node_id_to = edgeData.to;
        var node_type_from;
        var node_type_to;
        var multiple_connections_from_user_type = false;
        var to_start;
        var multiple_start_connection;
        var start_not_to_machine;
        var from_stop;

        for (var i = 0; i < this.nodes_data.length; i++ ) {
            if (this.nodes_data[i].id === node_id_from) {
                node_type_from = this.nodes_data[i].node_type;
            }
            if (this.nodes_data[i].id === node_id_to) {
                node_type_to = this.nodes_data[i].node_type;
            }
        }

        for (var i = 0; i < this.nodes_data.length; i++ ) { //uniemożliwienie połączenia od stopu
            if (this.nodes_data[i].id === node_id_from &&
            this.nodes_data[i].node_type === 'stop') {
                from_stop = true;
            }
        }
        if (from_stop === true) {
            alert('Nie możesz dodać połączenia od bloczka stopu.');
            callback();
            from_stop = false;

        } else {

            for (var i = 0; i < this.nodes_data.length; i++ ) { //uniemożl połączenia do startu
                if (node_type_from === 'start' || node_type_to === 'start') {
                    if (this.nodes_data[i].id === node_id_to &&
                    this.nodes_data[i].node_type === 'start') {
                        to_start = true;
                    }
                }
            }
            if (to_start === true) {
                alert('Nie możesz dodać połączenia prowadzącego do bloczka startu.');
                callback();
                to_start = false;

            } else { //uniemożliwienie dodania więcej niż jednego połączenia od startowego

                if (node_type_from === 'start' || node_type_to === 'start') {
                    var counter = 0;
                    for (var i = 0; i < this.nodes_data.length; i++ ) {
                        if (this.nodes_data[i].node_type === 'start') {
                            for (var q = 0; q < this.edges_data.length; q++) {
                                if (this.edges_data[q].from === this.nodes_data[i].id ||
                                this.edges_data[q].to === this.nodes_data[i].id) {
                                    counter++;
                                    if (counter >= 1) {
                                        multiple_start_connection = true;
                                    }
                                }
                            }
                        }
                    }
                }
                if (multiple_start_connection === true) {
                    alert('Nie może istnieć więcej niż jedno połączenie od bloczka startu.');
                    callback();
                    multiple_start_connection = false;

                } else { //musi być od startu do automatu

                    if (node_type_from === 'start' || node_type_to === 'start') {
                        for (var i = 0; i < this.nodes_data.length; i++) {
                            if (this.nodes_data[i].id === node_id_to &&
                            this.nodes_data[i].node_type !== 'machine') {
                                start_not_to_machine = true;
                            }
                        }
                    }
                    if (start_not_to_machine === true) {
                        alert('Połączenie od startu musi prowadzić do bloczka automatu.');
                        callback();
                        start_not_to_machine = false;

                    } else { //niejednoznaczne połączenie od user node

                        for (var i = 0; i < this.nodes_data.length; i++) {
                            if (this.nodes_data[i].id === node_id_from &&
                            this.nodes_data[i].node_type === 'user') {
                                var old_edge_from;
                                for (var q = 0; q < this.edges_data.length; q++) {
                                    if (this.edges_data[q].id === edgeData.id) {
                                        old_edge_from = this.edges_data[q].from;
                                    }
                                }
                                for (var q = 0; q < this.edges_data.length; q++) {
                                    if (this.edges_data[q].from === this.nodes_data[i].id
                                    && node_id_from !== old_edge_from) {
                                        multiple_connections_from_user_type = true;
                                    }
                                }
                            }
                        }
                        if (multiple_connections_from_user_type === true) {
                            alert('Może wystąpić tylko jedno połączenie z bloczka użytkownika.');
                            callback();
                            multiple_connections_from_user_type = false;

                        } else { //połączenie do samego siebie

                            if (edgeData.from === edgeData.to) {
                                alert('Nie możesz podłączyć bloczka do siebie samego.');
                                callback();

                            } else { //połączenie nodów tego samego typu

                                if (node_type_from === node_type_to) {
                                  alert('Nie możesz połączyć dwóch bloczków tego samego rodzaju.');
                                    callback();

                                } else { //połączenie już istnieje

                                    var connection_exist = false;

                                    for (var i = 0; i < this.edges_data.length; i++ ) {
                                    if (this.edges_data[i].from === node_id_from &&
                                    this.edges_data[i].to === node_id_to) {
                                        connection_exist = true;
                                    }
                                    }
                                    if (connection_exist === true) {
                                        alert('Takie połączenie już istnieje.');
                                        connection_exist = false;
                                        callback();

                                    } else { //wszystko ok

                                        callback(edgeData);

                                        for (var i = 0; i < this.edges_data.length; i++ ) {
                                            if (this.edges_data[i].id === edgeData.id) {
                                                this.edges_data[i].to = edgeData.to;
                                                this.edges_data[i].from = edgeData.from;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    deleteNode: (nodeData, callback) => {
        var deleted_node_type;
        for (var i = 0; i < this.nodes_data.length; i++ ) { //uniemożliwienie usunięcia startu
            if (this.nodes_data[i].id === nodeData.nodes[0]) {
                deleted_node_type = this.nodes_data[i].node_type;
            }
        }
        if (deleted_node_type === 'start') {
            alert('Nie możesz usunąć bloczka startu.');
            callback();

        } else {

            callback(nodeData);

            for (var i = 0; i < this.nodes_data.length; i++ ) { //usuwanie noda
                if (this.nodes_data[i].id === nodeData.nodes[0]) {
                    console.log('usuwam noda');
                    console.log(this.nodes_data);
                    this.nodes_data.splice(i, 1);
                    console.log(this.nodes_data);
                }
            }
            for (var i = 0; i < this.edges_data.length; i++ ) {
                //usuwanie edgów powiązanych z usuwanym nodem
                for (var q = 0; q < (nodeData.edges).length; q++) {
                    if (this.edges_data[i].id === nodeData.edges[q]) {
                        console.log('usuwam edga');
                        console.log(q);
                        console.log(this.edges_data);
                        this.edges_data.splice(i, 1);
                        console.log(this.edges_data);
                    }
                }
            }
        }
    },
    deleteEdge: (edgeData, callback) => {
        callback(edgeData);
        for (var i = 0; i < this.edges_data.length; i++ ) {
                if (this.edges_data[i].id === edgeData.edges[0]) {
                    console.log('usuwam edga');
                    console.log(this.edges_data);
                    this.edges_data.splice(i, 1);
                    console.log(this.edges_data);
                }
        }
    }
},

//---------------------- manipulation end ---------------------------------

            nodes: {
                shape: 'box',
                scaling: {
                    //label: {
                    //enabled: true
                    //}
                },
                color: {
                    background: '#CCC'
                }
            },
            edges: {
                arrows: {
                    to: true
                }
            },
           /* layout: {
                hierarchical:{
                    enabled: true
                }
            },
            physics: {
                enabled: false
            }*/
        };

        // initialize your network!
        this.network = new vis.Network(container, this.data, options);

        for (var i = 0; i < this.clusters_data.length; i++) {
            this.clusters_init(this.clusters_data[i].key);
        }

        (this.network).on('selectNode', (params) => {
            this.selected_node_id = params.nodes[0];
            console.log(this.selected_node_id);

             if (params.nodes.length === 1) {
                 if ((this.network).isCluster(params.nodes[0]) === true) {

                    for (var i = 0; i < this.clusters_data.length; i++ ) {
                        if (this.clusters_data[i].key + '_c' === this.selected_node_id) {
                            console.log('usuwam cluster');
                            console.log(this.clusters_data);
                            this.clusters_data.splice(i, 1);
                            console.log(this.clusters_data);
                        }
                    }

                     (this.network).openCluster(params.nodes[0]);

                 }
             }
         });

    }

    clusters_init(cluster_key: string) {
        var cluster_id = cluster_key + '_c';
        var clusterOptionsByData = {
            processProperties: (clusterOptions, childNodes) => {

                clusterOptions.id = cluster_id;
                clusterOptions.label = '[' + childNodes.length + ']';
                return clusterOptions;
            },
            clusterNodeProperties: { borderWidth: 3, shape: 'box',
            font: { size: 30 }, color: '#33ccff' }
        };
        this.network.clusterByConnection(cluster_key, clusterOptionsByData);
    }

    clusterByConnection() {
        if (this.selected_node_id !== '') {
            var edge_from_selected_exist = false;
            for (var i = 0; i < this.edges_data.length; i++) {
                //sprawdzenie czy bloczek nie jest sam
                if (this.edges_data[i].from === this.selected_node_id ||
                this.edges_data[i].to === this.selected_node_id) {
                    edge_from_selected_exist = true;
                }
            }

            if (edge_from_selected_exist === true) {
                //this.network.setData(this.data);
                var cluster_id = this.selected_node_id + '_c';
                var clusterOptionsByData = {
                    processProperties: (clusterOptions, childNodes) => {

                        clusterOptions.id = cluster_id;
                        clusterOptions.label = '[' + childNodes.length + ']';
                        return clusterOptions;
                    },
                    clusterNodeProperties: { borderWidth: 3, shape: 'box',
                    font: { size: 30 }, color: '#33ccff' }
                };
                this.network.clusterByConnection(this.selected_node_id, clusterOptionsByData);

                (this.clusters_data).push({ id: cluster_id, key: this.selected_node_id });
                console.log(this.clusters_data);

                this.selected_node_id = '';
            }
        }
    }
}
