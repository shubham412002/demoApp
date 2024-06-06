import { RegisterService } from './../register.service';
import { Component, OnInit } from '@angular/core';
import { ProfileDialogComponent } from '../profile-dialog/profile-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-search-section',
  templateUrl: './search-section.component.html',
  styleUrls: ['./search-section.component.css']
})
export class SearchSectionComponent implements OnInit {
  countries = [];
  constructor(
    private dialog:MatDialog,
    private registerService: RegisterService
  ) { }

  ngOnInit() {
    this.getCountries();
  }

  register() {
    let dialogRef = this.dialog.open(ProfileDialogComponent, {
      height: '600px',
      width: '600px',
      disableClose: true 
    });

  }

  changeSlide(index: number) {
    const slides = Array.from(document.querySelectorAll('.carousel-slide'));
    const dots = Array.from(document.querySelectorAll('.dot'));

    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === index);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  getCountries() {
    return this.registerService.getCountries().subscribe((res) => {
      if(res) {
        this.countries = res;
      } else {
        this.countries = [];
        console.log('Error getting countries');
      }
    })
  }

}


