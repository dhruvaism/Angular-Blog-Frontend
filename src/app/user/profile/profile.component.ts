import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { UserService } from './../../services/user.service';
import { User, UserResponse } from './../../models/user-model';
import { JwtService } from 'src/app/services/jwt.service';
import { Blog, BlogResponse, CommentResponse, LikeResponse } from './../../models/blog-model';
import { BlogService } from 'src/app/services/blog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  userId:number;
  user: User;
  loggedInUser:User;
  blogs: Blog[];
  commentForm: FormGroup;
  start:number = 0;
  months:string[] = ['Jan','Feb','March','April','may','June','July','Aug','Sept','Oct','Nov','Dec'];

  constructor(private userService: UserService,
              private blogService: BlogService,
              private jwt:JwtService,
              private route: ActivatedRoute,
              private router: Router,
              private formBuilder:FormBuilder) {
            this.user = null;
            this.blogs = [];
            this.userId = -1;
          }

  ngOnInit(): void {

    this.userService.user$.subscribe((user:User)=> {
      if(user) {
        this.loggedInUser = user;
      }else{
        this.user = null;
      }
    });
      this.userId = this.route.snapshot.queryParams['id'];
 
      this.commentForm = this.formBuilder.group({
        comment: ['',Validators.required],
      }); 
      this.getAllBlogByUser(0);
   
  }

  getAllBlogByUser(start:number) {
    this.userService.getUserById(this.userId).subscribe((userResponse: UserResponse) => {
      if(userResponse && userResponse.success) {
        this.user = userResponse.result;
        this.user.created_at = this.formatter(this.user.created_at);
        this.user.dob = this.formatter(this.user.dob);
        this.blogService.getAllBlogByUser(this.userId,start).subscribe((blogResponse: BlogResponse) => {
             this.blogs = blogResponse.result; 
             this.start = start;
             this.blogs.forEach(b=> {
               b.created_at = this.dateFormatter(b.created_at);
              this.blogService.getComments(b.id).subscribe((comments:CommentResponse) => {
                if(comments.success) {
                  b.comments = comments.result;
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
    });  
  }


  goToLogin() {
    this.router.navigateByUrl('user/login').then();
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

}
