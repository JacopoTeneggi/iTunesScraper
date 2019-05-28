import { Component, OnInit } from '@angular/core';
import { RestService } from '../rest.service';

export interface Stats {
  [key: string]: [];
}

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class StatsComponent implements OnInit {
  stats: Stats;

  // tslint:disable-next-line: no-shadowed-variable
  constructor(private RestService: RestService) { }

  ngOnInit() {
    this.showStats();
  }

  private showStats() {
    this.RestService.getStats().subscribe(data => {
      this.stats = data.body;
    });
  }

}
