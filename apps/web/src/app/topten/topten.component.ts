import { Component, OnInit } from '@angular/core';
import { RestService } from '../rest.service';

export interface VendorCount {
  hostingvendors: string;
  count: number;
}

@Component({
  selector: 'app-topten',
  templateUrl: './topten.component.html',
  styleUrls: ['./topten.component.css']
})
export class ToptenComponent implements OnInit {
  topten: VendorCount[];

// tslint:disable-next-line: no-shadowed-variable
  constructor(private RestService: RestService) { }

  ngOnInit() {
  }

}
