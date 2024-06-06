import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-frame-layout',
  templateUrl: './frame-layout.component.html',
  styleUrls: ['./frame-layout.component.css']
})
export class FrameLayoutComponent implements OnInit {
  showSearchSection: boolean = true;
  headerClass: string = '';
  lowHeaderHeight:string = '';

  constructor(
    private router:Router
  ) { }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateLayout(event.url);
      }
    });
  }

  updateLayout(url: string): void {
    if (url.includes('/profile')) {
      this.showSearchSection = false;
      this.headerClass = 'cyan-background'; 
      this.lowHeaderHeight = 'low-height'
    } else {
      this.showSearchSection = true;
      this.headerClass = '';
      this.lowHeaderHeight = '';
    }
  }
}
