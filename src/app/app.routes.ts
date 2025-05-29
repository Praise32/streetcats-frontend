import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PostComponent } from './post/post.component';

export const routes: Routes = [
    { // new Route in app.routes.ts
        path: "login",
        title: "Login",
        component: LoginComponent
    },
    {
        path: "post",
        title: "Post",
        component: PostComponent
    }
];

