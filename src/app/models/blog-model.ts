export class Blog {

    id: number;
    user_id: number;
    fname: string;
    lname: string;
    photoUrl:string;
    description: string;
    image_1:string;
    image_2:string;
    image_3:string;
    image_4:string;
    imageCount:number=0;
    created_at: string;
    likes:Like[];
    comments:Comment[];
    likeStatus:number; //-1 for no user, 0 for yet not liked, 1 for liked alredy
}

export class Like {
    user_id:number;
    fname:string;
    lname:string;


}

export class Comment {
    user_id:number;
    fname:string;
    lname:string;
    photoUrl:string;
    comment:string;
}

export class CommentResponse {
    success:number;
    errors:string;
    result:Comment[];
}

export class BlogResponse {
    success:number;
    result:Blog[];
}

export class LikeResponse {
    success:number;
    errors:string;
    result:Like[];
}

export class FileToUpload {
    file:File;
    localUrl:string;
    resultedUrl:string;
    progress:number;
  }
  