import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Blog, BlogResponse, LikeResponse, CommentResponse, FileToUpload } from '../models/blog-model';
import { JwtService } from './jwt.service';
import { UserService } from './user.service';
import { UserResponse } from '../models/user-model';
import { User } from './../models/user-model';
import { environment } from './../../environments/environment';
import { url } from 'inspector';

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  SERVER_URL = environment.SERVER_URL;
  jwtToken: JwtToken;
  user: User;
  headers:HttpHeaders;
  constructor(private http: HttpClient,
    private jwt: JwtService,
    private userService: UserService) {

    this.jwt.jwtToken$.subscribe((jwtToken: JwtToken) => {
      if (jwtToken) {
        this.jwtToken = jwtToken;
        this.headers = new HttpHeaders({
          'Authorization':this.jwtToken.token
        });
      }
    });
    this.userService.user$.subscribe((user: User) => {
      if (user) {
        this.user = user;
      }
    })


  }

  getAllBlog(start:number): Observable<BlogResponse> {
    const params = new HttpParams().append('start',`${start}`);
    return this.http.get<BlogResponse>(`${this.SERVER_URL}/blog`,{params:params});
  }


  getAllBlogByUser(userId: number, start:number): Observable<BlogResponse> {
    const params = new HttpParams().append('start',`${start}`).append('userId',`${userId}`);
    return this.http.get<BlogResponse>(`${this.SERVER_URL}/blog/user`,{params:params});
  }

  postBlog(formData: any, files:FileToUpload[]): Observable<any> {
    let urls:string[] = [];
    files.forEach(f => {
        if(f.resultedUrl) {
          urls.push(f.resultedUrl);
        }
    });
    while(urls.length<4) {
      urls.push(null);
    }
    
    
    return this.http.post<any>(`${this.SERVER_URL}/blog`, {
      userId: this.user.id,
      blog: {
        description: formData.description,
        image_1:urls[0],
        image_2:urls[1],
        image_3:urls[2],
        image_4:urls[3]
      }
    }, { headers: this.headers });
  }

  postComment(blogId: number, Data: any): Observable<any> {
    console.log(this.user.fname);
    return this.http.post<any>(`${this.SERVER_URL}/blog/comment`, {
      blogId: blogId,
      userId: this.user.id,
      comment: Data.comment}, { headers: this.headers });


  }

  getComments(blogId: number):Observable<CommentResponse> {
    return this.http.get<CommentResponse>(`${this.SERVER_URL}/blog/comment/${blogId}`);
  }

  getLikes(blogId: number):Observable<LikeResponse> {
    const params = new HttpParams().append('blogId',`${blogId}`);
    return this.http.get<LikeResponse>(`${this.SERVER_URL}/blog/like`,{params:params});
  }


  
  updateLike(blogId:number):Observable<any> {
     return this.http.post<any>(`${this.SERVER_URL}/blog/like`,{blogId:blogId,userId:this.user.id},{headers:this.headers});
  }

}

export interface JwtToken {
  id: number,
  token: string
}