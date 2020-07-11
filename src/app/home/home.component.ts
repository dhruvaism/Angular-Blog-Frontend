import { Component, OnInit } from '@angular/core';
import { BlogService } from './../services/blog.service';
import { Blog, BlogResponse,CommentResponse, LikeResponse } from '../models/blog-model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { JwtService } from '../services/jwt.service';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Console, timeStamp } from 'console';
import { User } from './../models/user-model';
import { UserService } from '../services/user.service';
import { HostListener } from '@angular/core';
import { async } from '@angular/core/testing';
import { environment } from './../../environments/environment';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  blogs:Blog[];
  user:User;
  commentForm:FormGroup;
  comment:Comment;
  start:number=0;
  months:string[] = ['Jan','Feb','March','April','may','June','July','Aug','Sept','Oct','Nov','Dec'];

  constructor(private router: Router,
              private blogService: BlogService,
              private fb: FormBuilder,
              private userService: UserService) {
    this.blogs = [];
    
  
   }

  ngOnInit(): void {

    this.userService.user$.subscribe((user:User)=> {
      if(user) {
        this.user = user;
      }else{
        this.user = null;
      }
    });
  
    this.getAllBlog(0);
    this.commentForm = this.fb.group({
      comment: ['',Validators.required],
    });
    
  
  }

  setPostImmages(blog:Blog) {
       if(blog.image_1){
         blog.imageCount=1;
       }
       if(blog.image_2){
        blog.imageCount++;
      }
      if(blog.image_3){
        blog.imageCount++;
      }
      if(blog.image_4){
        blog.imageCount++;
      }
      return blog;
  }



  dateFormatter(date:string){
    let ans:string;
    var mm = parseInt(date.slice(5,7));
    var yy = parseInt(date.slice(0,4));
    var dd = parseInt(date.slice(8,10));
    const cd = new Date();
    var cmm = cd.getMonth()+1;
    var cyy = cd.getFullYear();
    var cdd = cd.getDate();
    console.log(cyy+" "+yy);
    console.log(cmm+" "+mm);
    console.log(cdd+" "+dd);

    if(cyy==yy) {  //same year
        if(cmm==mm) { //same month
           if(cdd==dd) { //same day
             ans="today";
           }else{ //not same day
             ans=(cdd-dd)+" day ago";
           }
        }else{ //not same month
           ans = this.formatter(date);
        }
    }else{ //not same year
      ans = this.formatter(date);
    }
  return ans;
  
    
}

formatter(date:string){
  var mm = date.slice(5,7);
  var yy = date.slice(0,4);
  var dd = date.slice(8,10);
  mm = this.months[parseInt(mm)-1];
  if(parseInt(dd)==1) {
    dd = parseInt(dd)+"st";
  }else if(parseInt(dd)==2){
    dd = parseInt(dd)+"nd"
  }else if(parseInt(dd)==3){
    dd = parseInt(dd)+"rd"
  }else{
    dd = parseInt(dd)+"th"
  } 
  return (dd +" "+mm+ " "+yy);
}

  getAllBlog(start:number) {
   
    this.blogService.getAllBlog(start).subscribe((blogResponse:BlogResponse) => {
      this.blogs = blogResponse.result;
      this.start=start;
      console.log(this.blogs);
      this.blogs.forEach(b=> {
              b.created_at = this.dateFormatter(b.created_at);
              b = this.setPostImmages(b);
              this.blogService.getComments(b.id).subscribe((commentResponse:CommentResponse) => {
                if(commentResponse.success) {
                  b.comments = commentResponse.result;
                }
              });
              this.blogService.getLikes(b.id).subscribe((likeResponse:LikeResponse)=>{
                if(likeResponse.success) {
                  b.likes = likeResponse.result;
                  let found = false;
                  b.likes.forEach(l => {
                       if(this.user && (this.user.id==l.user_id)) {
                          found = true;
                       }
                  });
                  if(found){
                    b.likeStatus = 1;
                  }else if(!found && this.user){
                    b.likeStatus = 0;
                  }else{
                    b.likeStatus = -1;
                  }
                }
              });
      });
    });
  }

  goToProfile(userId:number) {
    this.router.navigate(['user/profile'],{queryParams:{id:userId}});
  }
  
  
  onSubmit(blogId: number) {

    this.blogService.postComment(blogId,this.commentForm.value).subscribe(response => {
      console.log(response);   
      if(response && response.success) {
           this.commentForm.reset();
           this.blogService.getComments(blogId).subscribe((comments:CommentResponse)=> {
                 if(comments && comments.success) {
                   this.blogs.forEach(b => {
                     if(b.id === blogId) {
                       b.comments = comments.result;
                     }
                   })
                 }
           });
         }
    });
  }

  updateLikeCount(blogId:number) {
       this.blogs.forEach(b=>{
           if(b.id===blogId){
             if(b.likeStatus==0){
               b.likeStatus = 1;
               b.likes.push({
                 user_id:this.user.id,
                 fname:this.user.fname,
                 lname:this.user.lname
               });
             }else{
               b.likeStatus = 0;
               b.likes.splice(b.likes.indexOf({
                user_id:this.user.id,
                fname:this.user.fname,
                lname:this.user.lname
               }),1);
             }
           }
       });
       this.blogService.updateLike(blogId).subscribe();
  }

  onWindowScroll(event:any) {
    console.log(event);
  }

  
}
