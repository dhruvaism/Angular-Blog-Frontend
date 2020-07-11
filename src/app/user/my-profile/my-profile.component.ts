import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { UserService } from '../../services/user.service';
import { User, UserResponse } from '../../models/user-model';
import { JwtService } from 'src/app/services/jwt.service';
import { Blog, BlogResponse, CommentResponse, LikeResponse } from '../../models/blog-model';
import { BlogService } from 'src/app/services/blog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { environment } from './../../../environments/environment';
import { FileToUpload } from './../../models/blog-model';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

  user: User;
  blogs: Blog[];
  commentForm:FormGroup;
  postForm:FormGroup;
  start:number = 0;
  selectedFile:File = null;
  selectedUrl:String = null;
  progress:number = -1;
  files:FileToUpload[] = [];
  file:FileToUpload;
  @ViewChild('closeBtn') closeBtn:ElementRef;
  months:string[] = ['Jan','Feb','March','April','may','June','July','Aug','Sept','Oct','Nov','Dec'];
  constructor(private userService: UserService,
              private blogService: BlogService,
              private jwt:JwtService,
              private route: ActivatedRoute,
              private router: Router,
              private formBuilder:FormBuilder) {
            this.user = null;
            this.blogs = [];
          }
  
  ngOnInit(): void {
    this.userService.user$.subscribe((user:User)=> {
      if(user) {
            this.user = user;
            this.getAllBlogbyUser(0);
            
      }else{
        this.user = null;
      }
    });

    this.postForm = this.formBuilder.group({
      description: ['',Validators.required],
    });
    
    this.commentForm = this.formBuilder.group({
      comment: ['',Validators.required],
    });
     
  }

  cancelPost(){
    this.files = [];
    this.postForm.reset();
  }  
 
  onUpload(file:File,index:number){
    this.userService.uploadImage(file).subscribe(event => {
      if(event.type === HttpEventType.UploadProgress) {
        this.files[index].progress =  Math.round(event.loaded / event.total* 100);
        
      } else if(event.type === HttpEventType.Response) {
        if(event.body.success===1) {
          this.files[index].resultedUrl = event.body.path;
          console.log(this.files[index].resultedUrl);
        }
      }
    });
}

  onFileSelected(e:any) {
    console.log("Filed ");
    let reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = (event:any)=> {
        this.file = {
          file:e.target.files[0],
          localUrl:event.target.result,
          resultedUrl:null,
          progress:0
        };
        this.files.push(this.file);
        this.onUpload(this.file.file,this.files.length-1);
    };
  }

  onProfileUpload(){
        this.userService.uploadProfile(this.selectedFile).subscribe(event => {
          if(event.type === HttpEventType.UploadProgress) {
            console.log(event);
            this.progress =  Math.round(event.loaded / event.total* 100);
            if(this.progress==100) {
              this.closeBtn.nativeElement.click();
              this.userService.getUserByJwt();
            }
          } else if(event.type === HttpEventType.Response) {
            console.log(event);
          }
        });
  }

  onFileProfileSelected(event:any) {
    this.selectedFile = event.target.files[0];
    let reader = new FileReader();
    reader.readAsDataURL(this.selectedFile);
    reader.onload = (event:any)=> {
        this.selectedUrl = event.target.result;
        this.progress = 0; 

    }
  }

  getAllBlogbyUser(start:number) {
    this.blogService.getAllBlog(start).subscribe((blogResponse:BlogResponse) => {
      this.blogs = blogResponse.result;
      this.start=start;
      console.log(this.blogs);
      this.blogs.forEach(b=> {
              b = this.setPostImmages(b);
              b.created_at = this.dateFormatter(b.created_at);
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

  createPost() {
    if(this.postForm.valid) {
      this.blogService.postBlog(this.postForm.value,this.files).subscribe((response:any)=>{
        if(response.success) {
          this.getAllBlogbyUser(0);
          this.postForm.reset();
          this.files = [];
        }
      });
    }
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

