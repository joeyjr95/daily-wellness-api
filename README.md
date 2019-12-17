# How You Doin Server

## Tech stack

Node, Express, Knex, PostgreSQL, Mocha, Chai

## API Endpoints

### Overview

`A` -- requires `Authorization` header using Bearer  
`JSON` -- requires Header `content-type: application/json`

| Method | Endpoint                                                                             | Usage                                         | Returns                   | Header Fields |
| ------ | ------------------------------------------------------------------------------------ | --------------------------------------------- | ------------------------- | ------------- |
| POST   | [/api/auth/login](#post-apiauthtoken)                                                | Authenticate a user                           | JWT                       | JSON          |
| PUT    | /api/auth/refresh                                                                    | Re-authenticate a user                        | JWT                       | A / JSON      |
| POST   | [/api/users](#post-apiusers)                                                         | Register a new user                           | User Object               | JSON          |
| GET    | [/api/users](#get-apiusers)                                                          | Get account information for logged in user    | User Object               | A / JSON      |

| POST   | [/api/reflections](#post-apireflections)                                                         | Create a new reflection                            | New reflection Object           | A / JSON      |
| GET    | [/api/reflections](#get-apireflections)                                                          | Get all reflections user is assigned to             | Array of reflection objects     | A / JSON      |
| PATCH  | [/api/reflections/reflections_id](#patch-apireflectionsreflection_id)                               | Edit a reflection                                   | Edited reflection Object        | A / JSON      |
| DELETE | [/api/reflections/reflections_id](#delete-apireflectionsreflection_id)                              | Delete a reflection                                 | -                         | A             |
| GET   | [/api/averages](#get-apiaverages)                                               | get averages for a User             | Object       | A / JSON      |


