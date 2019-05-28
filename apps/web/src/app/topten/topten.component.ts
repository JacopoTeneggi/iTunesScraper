import { Component, OnInit } from '@angular/core';
import { RestService } from '../rest.service';
declare const numeral: any;

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
    this.showTopTen();
  }

  private showTopTen() {
    this.RestService.getTopTen().subscribe(data => {
      this.topten = data.body.map(vendor => {
        const count = vendor.count;
        vendor.count = numeral(count).format('0.0a');
        return vendor;
      });
    });
  }

}
