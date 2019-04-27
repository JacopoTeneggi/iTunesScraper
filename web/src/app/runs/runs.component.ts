import { Component, OnInit } from '@angular/core';
import { RestService } from '../rest.service';
import { State } from '../../../../lib/podcast-tools/index';

export interface Batch {
  _batchId: string;
  records: State[];
}

export interface Run {
  _id: string;
  batches: Batch[];
}

@Component({
  selector: 'app-runs',
  templateUrl: './runs.component.html',
  styleUrls: ['./runs.component.css']
})
export class RunsComponent implements OnInit {
  title = 'web';
  runs: Run[];

  // tslint:disable-next-line: no-shadowed-variable
  constructor(private RestService: RestService) { }

  ngOnInit() {
    this.showRuns();
  }

  private showRuns() {
    this.RestService.getAllRuns().subscribe(data => {
      this.runs = data.body;
    });
  }
}
