import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss'
})
export class PostComponent implements OnInit {
  constructor(private http: HttpClient) { }
  catFact: string = "";

  ngOnInit(): void {
  }

  loadCatFact() {
    let url = "http://localhost:5003/posts/7";
    this.http.get<{ id: number, title: string, description: string, latitude: number | null, longitude: number | null, address: string, city: string, cap: number, createdAt: string, updatedAt: string, userId: number }>(url)
      .subscribe(data => {
        this.catFact = data.title;
        console.log(data);
      });
  }
}