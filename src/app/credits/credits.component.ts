import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Library } from '../models';
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
  httpClient: HttpClient;

  constructor(http: HttpClient) {
    this.authors = ['Michaela Andermann', 'Philip Gerke'].sort(() => 0.5 - Math.random()).join(', ');
    this.httpClient = http;
  }

  ngOnInit(): void {
    void this.httpClient.get('assets/license.json').toPromise().then((response: Response) => {
      Object.keys(response).forEach((key: string) => {
        const library: Library = response[key] as Library;
        if (library.licenses !== 'UNLICENSED') {
          this.libraries.push(library);
        }
      });
      console.log(`Loaded ${this.libraries.length} libraries.`);
    });
  }
}
