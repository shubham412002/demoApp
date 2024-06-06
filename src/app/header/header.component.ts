import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  headerClass: string = '';
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
      this.headerClass = 'cyan-background'; 
    } else {
      this.headerClass = '';
    }
  }


  goToHome() {
    this.router.navigate(['/home']);
  }
}
