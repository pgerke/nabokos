import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Library } from '../models/library';
import { version } from '../../../package.json';

@Component({
  selector: 'app-credits',
  templateUrl: './credits.component.html',
  styleUrls: ['./credits.component.scss']
})
export class CreditsComponent implements OnInit {
  readonly appVersion: string = version;
  libraries: Library[] = [];
  readonly year = (new Date()).getFullYear();
  authors: string;

  constructor(http: HttpClient) {
    this.authors = ['Michaela Andermann', 'Philip Gerke'].sort((a, b) => 0.5 - Math.random()).join(', ');
    http.get('assets/license.json').toPromise().then((response: Response) => {
      Object.keys(response).forEach(key => {
        const library: Library = response[key];
        if (library.licenses !== 'UNLICENSED') {
          this.libraries.push(library);
        }
      });
      console.log(`Loaded ${this.libraries.length} libraries.`);
    });
  }

  ngOnInit() {}
}