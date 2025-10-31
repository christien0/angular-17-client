# Angular 17 example project: CRUD with Rest API

Build an Angular 17 CRUD example App to consume Rest APIs, display, modify & search data.

Tutorial Application in that:
- Each Tutorial has id, title, description, published status.
- We can create, retrieve, update, delete Tutorials.
- There is a Search bar for finding Tutorials by title.

![angular-17-crud-example](angular-17-crud-example.png)

Run `ng serve --port 8081` for a dev server. Navigate to `http://localhost:8081/`. The app will automatically reload if you change any of the source files.

For instruction, please visit:
> [Angular 17 CRUD example with Rest API](https://www.bezkoder.com/angular-17-crud-example/)

More Practice:
> [Angular 17 Pagination example](https://www.bezkoder.com/angular-17-pagination-ngx/)

> [Angular 17 JWT Authentication & Authorization example](https://www.bezkoder.com/angular-17-jwt-auth/)

> [Angular 17 File upload example with Progress bar](https://www.bezkoder.com/angular-17-file-upload/)

> [Angular 17 Form Validation example](https://www.bezkoder.com/angular-17-form-validation/)

Fullstack with Node:

> [Angular 17 + Node Express + MySQL example](https://www.bezkoder.com/angular-17-node-js-express-mysql/)

> [Angular 17 + Node Express + PostgreSQL example](https://www.bezkoder.com/angular-17-node-js-express-postgresql/)

> [Angular 17 + Node Express + MongoDB example](https://www.bezkoder.com/angular-17-node-js-express-mongodb/)

> [Angular 17 + Node Express: File upload example](https://www.bezkoder.com/angular-17-node-express-file-upload/)

```markdown
# Angular 17 example project: CRUD with Rest API

Build an Angular 17 CRUD example App to consume Rest APIs, display, modify & search data.

Tutorial Application in that:
- Each Tutorial has id, title, description, published status.
- We can create, retrieve, update, delete Tutorials.
- There is a Search bar for finding Tutorials by title.

![angular-17-crud-example](angular-17-crud-example.png)

Run `ng serve --port 8081` for a dev server. Navigate to `http://localhost:8081/`. The app will automatically reload if you change any of the source files.

For instruction, please visit:
> [Angular 17 CRUD example with Rest API](https://www.bezkoder.com/angular-17-crud-example/)

More Practice:
> [Angular 17 Pagination example](https://www.bezkoder.com/angular-17-pagination-ngx/)

> [Angular 17 JWT Authentication & Authorization example](https://www.bezkoder.com/angular-17-jwt-auth/)

> [Angular 17 File upload example with Progress bar](https://www.bezkoder.com/angular-17-file-upload/)

> [Angular 17 Form Validation example](https://www.bezkoder.com/angular-17-form-validation/)

Fullstack with Node:

> [Angular 17 + Node Express + MySQL example](https://www.bezkoder.com/angular-17-node-js-express-mysql/)

> [Angular 17 + Node Express + PostgreSQL example](https://www.bezkoder.com/angular-17-node-js-express-postgresql/)

> [Angular 17 + Node Express + MongoDB example](https://www.bezkoder.com/angular-17-node-js-express-mongodb/)

> [Angular 17 + Node Express: File upload example](https://www.bezkoder.com/angular-17-node-express-file-upload/)

Fullstack with Spring Boot:

> [Angular 17 + Spring Boot example](https://www.bezkoder.com/spring-boot-angular-17-crud/)

> [Angular 17 + Spring Boot + MySQL example](https://www.bezkoder.com/spring-boot-angular-17-mysql/)

> [Angular 17 + Spring Boot + PostgreSQL example](https://www.bezkoder.com/spring-boot-angular-17-postgresql/)

> [Angular 17 + Spring Boot + MongoDB example](https://www.bezkoder.com/spring-boot-angular-17-mongodb/)

> [Angular 17 + Spring Boot: File upload example](https://www.bezkoder.com/angular-17-spring-boot-file-upload/)

Fullstack with Django:
> [Angular + Django example](https://www.bezkoder.com/django-angular-13-crud-rest-framework/)

> [Angular + Django + MySQL](https://www.bezkoder.com/django-angular-mysql/)

> [Angular + Django + PostgreSQL](https://www.bezkoder.com/angular-17-crud/)

Security:
> [Angular 17 + Spring Boot: JWT Authentication and Authorization example](https://www.bezkoder.com/angular-17-spring-boot-jwt-auth/)

> [Angular 17 + Node.js Express: JWT Authentication and Authorization example](https://www.bezkoder.com/node-js-angular-17-jwt-auth/)

Serverless with Firebase:
> [Angular 17 Firebase CRUD with Realtime DataBase](https://www.bezkoder.com/angular-17-firebase-crud/)

> [Angular 17 Firestore CRUD example](https://www.bezkoder.com/angular-17-firestore-crud/)

> [Angular 17 Firebase Storage: File Upload/Display/Delete example](https://www.bezkoder.com/angular-17-firebase-storage/)

Integration (run back-end & front-end on same server/port)
> [How to integrate Angular with Node Restful Services](https://bezkoder.com/integrate-angular-12-node-js/)

> [How to Integrate Angular with Spring Boot Rest API](https://bezkoder.com/integrate-angular-12-spring-boot/)
```

## Docker

This repository includes a Dockerfile to build the Angular app in a Node builder image and serve the production build with nginx.

Files added:

- `Dockerfile` — multi-stage build (Node -> nginx)
- `default.conf` — nginx server config with SPA fallback (try_files -> /index.html)
- `.dockerignore` — excludes `node_modules`, `dist`, etc. from the Docker build context

Build and run (from repository root):

```powershell
# Build the Docker image
docker build -t angular-17-crud:latest .

# Run the container, map port 80 to host port 80
docker run -d -p 80:80 --name angular-17-crud angular-17-crud:latest
```

Notes:

- The Docker build runs `npm install` then `npm run build -- --configuration production` and copies the resulting `dist/angular-17-crud` into nginx.
- If your backend API runs on the host, you can enable proxying in `default.conf` (there's a commented example).
- If you have a `package-lock.json`, you can edit the Dockerfile to use `npm ci` for faster, reproducible installs.
